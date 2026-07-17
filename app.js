/* Carnet — mes recettes Instagram + liste de courses
   Données stockées en local sur l'appareil (localStorage). */
(function(){
"use strict";

var RAYONS = ["Fruits & Légumes","Viande & Poisson","Crèmerie & Œufs","Épicerie","Boulangerie","Surgelés","Autre"];
var TAGS = ["Plat","Entrée","Dessert","Veggie","Vegan","Rapide","Brunch"];
var GRADS = [
  ["#F5E6C4","#EAD3A0"],["#F3D9B1","#E8B87E"],["#EFD3B5","#DFAF7E"],["#F2E7BD","#E2CE8F"],
  ["#DCE8CE","#BBD6A4"],["#F0CDB4","#E3A183"],["#EBDCC8","#D6BC9C"],["#F3D4CB","#E7A796"]
];

var LS_RECIPES = "carnet.recipes.v1";
var LS_STATE = "carnet.state.v1";

/* ================= Stockage ================= */
function loadRecipes(){
  try{
    var raw = localStorage.getItem(LS_RECIPES);
    if(raw) return JSON.parse(raw);
  }catch(e){}
  return null;
}
function saveRecipes(){
  try{ localStorage.setItem(LS_RECIPES, JSON.stringify(recipes)); }catch(e){}
}
function loadState(){
  try{
    var raw = localStorage.getItem(LS_STATE);
    if(raw) return JSON.parse(raw);
  }catch(e){}
  return {};
}
function saveState(){
  try{
    localStorage.setItem(LS_STATE, JSON.stringify({
      selected:state.selected, checked:state.checked, list:state.list
    }));
  }catch(e){}
}

/* ================= Recettes d'exemple ================= */
function demoRecipes(){
  return [
   {id:"d1", title:"Pâtes crémeuses au citron", handle:"@pastalover.fr", url:"", time:20, tags:["Plat","Rapide"], serves:4, emoji:"🍝", grad:GRADS[0],
    ing:[{n:"Spaghetti",q:400,u:"g",r:"Épicerie"},{n:"Citrons",q:2,u:"",r:"Fruits & Légumes"},{n:"Parmesan",q:80,u:"g",r:"Crèmerie & Œufs"},{n:"Crème fraîche",q:20,u:"cl",r:"Crèmerie & Œufs"},{n:"Ail",q:2,u:"gousses",r:"Fruits & Légumes"},{n:"Basilic",q:1,u:"bouquet",r:"Fruits & Légumes"}],
    steps:["Cuire les spaghetti al dente, garder un verre d'eau de cuisson.","Faire revenir l'ail, ajouter crème, zestes et jus de citron.","Mélanger pâtes, sauce et parmesan, détendre avec l'eau de cuisson, finir au basilic."]},
   {id:"d2", title:"Curry de pois chiches coco", handle:"@healthy.marion", url:"", time:30, tags:["Veggie","Vegan"], serves:4, emoji:"🍛", grad:GRADS[1],
    ing:[{n:"Pois chiches",q:2,u:"boîtes",r:"Épicerie"},{n:"Lait de coco",q:40,u:"cl",r:"Épicerie"},{n:"Oignons",q:1,u:"",r:"Fruits & Légumes"},{n:"Curry en poudre",q:1,u:"c.à.s",r:"Épicerie"},{n:"Riz basmati",q:300,u:"g",r:"Épicerie"},{n:"Épinards frais",q:200,u:"g",r:"Fruits & Légumes"}],
    steps:["Faire revenir l'oignon avec le curry.","Ajouter pois chiches et lait de coco, laisser mijoter 15 min.","Incorporer les épinards, servir avec le riz."]},
   {id:"d3", title:"Poulet rôti miel-sésame", handle:"@chez.benoit", url:"", time:45, tags:["Plat"], serves:4, emoji:"🍗", grad:GRADS[2],
    ing:[{n:"Cuisses de poulet",q:4,u:"",r:"Viande & Poisson"},{n:"Miel",q:3,u:"c.à.s",r:"Épicerie"},{n:"Sauce soja",q:6,u:"c.à.s",r:"Épicerie"},{n:"Graines de sésame",q:2,u:"c.à.s",r:"Épicerie"},{n:"Riz basmati",q:250,u:"g",r:"Épicerie"},{n:"Brocoli",q:1,u:"",r:"Fruits & Légumes"}],
    steps:["Mélanger miel et sauce soja, badigeonner le poulet.","Enfourner 40 min à 200 °C en arrosant à mi-cuisson.","Parsemer de sésame, servir avec riz et brocoli vapeur."]},
   {id:"d4", title:"Shakshuka du dimanche", handle:"@brunch.club", url:"", time:25, tags:["Veggie","Brunch"], serves:2, emoji:"🍳", grad:GRADS[5],
    ing:[{n:"Œufs",q:4,u:"",r:"Crèmerie & Œufs"},{n:"Tomates concassées",q:2,u:"boîtes",r:"Épicerie"},{n:"Poivron rouge",q:1,u:"",r:"Fruits & Légumes"},{n:"Oignons",q:1,u:"",r:"Fruits & Légumes"},{n:"Ail",q:2,u:"gousses",r:"Fruits & Légumes"},{n:"Feta",q:100,u:"g",r:"Crèmerie & Œufs"}],
    steps:["Faire compoter oignon, poivron et ail, ajouter les tomates.","Creuser des puits, casser les œufs, couvrir 6 min.","Émietter la feta, servir à la poêle."]},
   {id:"d5", title:"Banana bread aux noix", handle:"@lucie.patisse", url:"", time:50, tags:["Dessert"], serves:6, emoji:"🍌", grad:GRADS[3],
    ing:[{n:"Bananes bien mûres",q:3,u:"",r:"Fruits & Légumes"},{n:"Farine",q:200,u:"g",r:"Épicerie"},{n:"Œufs",q:2,u:"",r:"Crèmerie & Œufs"},{n:"Sucre roux",q:80,u:"g",r:"Épicerie"},{n:"Beurre",q:100,u:"g",r:"Crèmerie & Œufs"},{n:"Noix",q:50,u:"g",r:"Épicerie"}],
    steps:["Écraser les bananes avec le beurre fondu et le sucre.","Ajouter œufs, farine et noix, verser dans un moule à cake.","Cuire 45 min à 180 °C."]}
  ];
}

/* ================= Analyse d'une légende Instagram ================= */
var UNITS = [
  {re:/^(kg|kilos?|kilogrammes?)$/i, u:"kg"},
  {re:/^(g|gr|grammes?)$/i, u:"g"},
  {re:/^(l|litres?)$/i, u:"l"},
  {re:/^(cl)$/i, u:"cl"},
  {re:/^(ml)$/i, u:"ml"},
  {re:/^(c(?:\.|uill?[eè]res?)? ?(?:à|a)? ?s(?:oupe)?\.?|cas|cs)$/i, u:"c.à.s"},
  {re:/^(c(?:\.|uill?[eè]res?)? ?(?:à|a)? ?c(?:af[eé])?\.?|cac|cc)$/i, u:"c.à.c"},
  {re:/^(bo[iî]tes?|conserves?)$/i, u:"boîtes"},
  {re:/^(sachets?)$/i, u:"sachets"},
  {re:/^(gousses?)$/i, u:"gousses"},
  {re:/^(tranches?)$/i, u:"tranches"},
  {re:/^(bouquets?)$/i, u:"bouquet"},
  {re:/^(pinc[eé]es?)$/i, u:"pincées"},
  {re:/^(briques?)$/i, u:"briques"},
  {re:/^(pots?)$/i, u:"pots"},
  {re:/^(verres?)$/i, u:"verres"},
  {re:/^(poign[eé]es?)$/i, u:"poignées"},
  {re:/^(filets?)$/i, u:"filets"},
  {re:/^(pav[eé]s?)$/i, u:"pavés"}
];
var RAYON_WORDS = [
  {r:"Fruits & Légumes", w:["tomate","salade","oignon","ail","citron","pomme","banane","carotte","courgette","aubergine","poivron","brocoli","épinard","epinard","avocat","concombre","champignon","patate","pomme de terre","herbe","basilic","persil","coriandre","menthe","gingembre","échalote","echalote","poireau","fenouil","mangue","fraise","framboise","abricot","pêche","peche","poire","raisin","kiwi","orange","clémentine","citrouille","potiron","butternut","haricot vert","radis","betterave","céleri","celeri","chou","mâche","roquette","fruit","légume","legume"]},
  {r:"Viande & Poisson", w:["poulet","bœuf","boeuf","porc","veau","agneau","canard","dinde","lardon","jambon","saucisse","chorizo","steak","viande","merguez","saumon","cabillaud","thon","crevette","poisson","truite","dorade","lieu","colin","moule","gambas","chair à saucisse"]},
  {r:"Crèmerie & Œufs", w:["lait","beurre","crème","creme","œuf","oeuf","yaourt","fromage","parmesan","mozzarella","feta","chèvre","chevre","comté","comte","gruyère","gruyere","emmental","mascarpone","ricotta","burrata","raclette","skyr","crème fraîche"]},
  {r:"Boulangerie", w:["pain","baguette","brioche","tortilla","wrap","pita","burger bun","pain burger"]},
  {r:"Surgelés", w:["surgelé","surgele","glace","petits pois surgelés"]}
];
function guessRayon(name){
  var n = name.toLowerCase();
  for(var i=0;i<RAYON_WORDS.length;i++){
    for(var j=0;j<RAYON_WORDS[i].w.length;j++){
      if(n.indexOf(RAYON_WORDS[i].w[j])>=0) return RAYON_WORDS[i].r;
    }
  }
  return "Épicerie";
}
/* ================= Nutrition (par 100 g : kcal, protéines, glucides, dont sucres, lipides) ================= */
function norm(s){
  return String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"");
}
/* k: mots-clés (sans accents) · v: [kcal, prot, gluc, sucres, lip] pour 100 g · u: poids moyen d'une pièce en g · boxG: poids d'une boîte */
var NUTRI = [
  {k:["cuisse de poulet","cuisses de poulet","cuisse"], u:250, v:[190,18,0,0,12]},
  {k:["poulet","dinde","volaille"], u:150, v:[145,21,0,0,6]},
  {k:["boeuf","steak hache","steak"], u:150, v:[250,26,0,0,16]},
  {k:["porc","echine"], u:150, v:[260,25,0,0,17]},
  {k:["agneau"], u:150, v:[280,25,0,0,20]},
  {k:["canard"], u:180, v:[200,19,0,0,14]},
  {k:["lardon","bacon"], v:[300,14,1,1,27]},
  {k:["jambon"], u:40, v:[110,20,1,1,3]},
  {k:["saucisse","merguez","chorizo"], u:80, v:[320,14,2,1,28]},
  {k:["saumon"], u:130, v:[200,20,0,0,13]},
  {k:["thon"], boxG:140, v:[130,26,0,0,1]},
  {k:["crevette","gambas"], v:[100,21,0.5,0,1]},
  {k:["anchois"], u:4, v:[200,25,0,0,10]},
  {k:["cabillaud","colin","lieu","dorade","truite","poisson"], u:130, v:[110,22,0,0,2]},
  {k:["oeuf"], u:55, v:[140,12.5,0.7,0.7,10]},
  {k:["beurre"], v:[740,0.7,0.5,0.5,82]},
  {k:["creme fraiche","creme liquide","creme epaisse","creme"], v:[300,2.5,3,3,30]},
  {k:["lait de coco","creme de coco"], v:[180,1.8,3,2.5,18]},
  {k:["lait d'amande","lait de soja","lait d'avoine","lait vegetal","lait de riz"], v:[40,1.5,4,3,1.5]},
  {k:["lait"], v:[65,3.3,4.8,4.8,3.6]},
  {k:["parmesan"], v:[400,36,0,0,28]},
  {k:["feta"], v:[270,14,1.5,1.5,23]},
  {k:["mozzarella","burrata"], u:125, v:[280,18,2,1,22]},
  {k:["mascarpone"], v:[420,4.5,4,4,44]},
  {k:["ricotta"], v:[160,9,4,4,12]},
  {k:["chevre"], v:[290,19,1,1,23]},
  {k:["comte","gruyere","emmental","raclette","cheddar","fromage rape","fromage"], v:[400,27,0.5,0.5,32]},
  {k:["yaourt","skyr"], u:125, v:[60,4,5,5,3]},
  {k:["tofu"], v:[120,12,2,0.5,7]},
  {k:["pois chiche"], boxG:265, v:[120,7,14,0.5,2.5]},
  {k:["lentille"], boxG:265, v:[115,9,17,0.5,0.5]},
  {k:["haricot rouge","haricot blanc"], boxG:255, v:[100,8,13,0.5,0.5]},
  {k:["mais"], boxG:285, v:[100,3,19,5,1.5]},
  {k:["spaghetti","tagliatelle","penne","fusilli","macaroni","pates","nouille"], v:[360,12,72,3,1.5]},
  {k:["riz"], v:[350,7,78,0.5,0.6]},
  {k:["quinoa"], v:[360,14,60,2,6]},
  {k:["semoule","boulgour"], v:[360,12,72,1,1]},
  {k:["flocons d'avoine","avoine"], v:[370,13,60,1,7]},
  {k:["farine"], v:[360,10,73,1,1]},
  {k:["maizena","fecule"], v:[350,0.5,86,0,0]},
  {k:["sucre glace","sucre roux","sucre"], v:[400,0,100,100,0]},
  {k:["miel","sirop d'erable","sirop d'agave"], v:[310,0.3,80,78,0]},
  {k:["chocolat"], v:[540,6,55,50,32]},
  {k:["cacao"], v:[280,20,15,2,15]},
  {k:["boudoir","biscuit cuiller"], u:6, v:[390,6,75,45,5]},
  {k:["biscuit","speculoos"], u:8, v:[480,6,70,35,20]},
  {k:["pain de campagne","pain","baguette"], u:250, v:[270,9,55,3,1.5]},
  {k:["brioche"], u:45, v:[370,8,50,14,15]},
  {k:["tortilla","wrap","pita"], u:60, v:[300,8,52,3,6]},
  {k:["pate a gyoza","feuille de gyoza","pate a ravioli"], u:8, v:[280,8,58,2,1]},
  {k:["pate feuilletee","pate brisee","pate sablee"], u:230, v:[400,6,42,3,23]},
  {k:["huile"], v:[900,0,0,0,100]},
  {k:["sauce soja"], v:[55,6,5,2,0]},
  {k:["mayonnaise"], v:[700,1,2,2,76]},
  {k:["moutarde"], v:[150,7,6,3,11]},
  {k:["concentre de tomate"], v:[80,4,14,12,0.5]},
  {k:["tomates concassees","tomates pelees","coulis de tomate","passata"], boxG:400, v:[25,1.2,3.5,3,0.2]},
  {k:["tomate cerise","tomate"], u:120, v:[18,0.9,3,2.6,0.2]},
  {k:["noix de cajou"], v:[600,18,27,6,44]},
  {k:["noix"], v:[650,15,10,3,65]},
  {k:["amande","noisette"], v:[620,20,10,4,55]},
  {k:["cacahuete","beurre de cacahuete"], v:[600,26,12,5,50]},
  {k:["sesame"], v:[570,18,10,0.3,50]},
  {k:["graines de courge","graines de tournesol","graine"], v:[560,25,12,1,48]},
  {k:["olive"], v:[150,1,1,0,15]},
  {k:["avocat"], u:150, v:[160,2,2,0.5,15]},
  {k:["banane"], u:120, v:[90,1,20,15,0.3]},
  {k:["citron vert","citron"], u:100, v:[30,0.6,3,2.5,0.3]},
  {k:["orange","clementine"], u:150, v:[47,0.9,11,9,0.1]},
  {k:["pomme de terre","patate douce","patate"], u:150, v:[82,2,18,1,0.1]},
  {k:["pomme"], u:150, v:[52,0.3,12,10,0.2]},
  {k:["poire"], u:160, v:[57,0.4,14,10,0.1]},
  {k:["fraise","framboise","fruits rouges"], v:[35,0.7,7,6,0.3]},
  {k:["mangue"], u:300, v:[60,0.8,14,13,0.4]},
  {k:["oignon rouge","oignon"], u:150, v:[40,1,8,5,0.1]},
  {k:["echalote"], u:25, v:[70,1.5,14,8,0.1]},
  {k:["ail"], u:5, v:[130,6,28,1,0.5]},
  {k:["gingembre"], u:30, v:[80,1.8,18,2,0.8]},
  {k:["poivron"], u:150, v:[25,1,5,3.5,0.3]},
  {k:["courgette"], u:250, v:[17,1.2,3,2.5,0.3]},
  {k:["aubergine"], u:300, v:[24,1,5,3,0.2]},
  {k:["brocoli"], u:400, v:[30,2.8,4,1.5,0.4]},
  {k:["epinard"], v:[25,2.9,1.5,0.5,0.4]},
  {k:["salade","romaine","mache","roquette","laitue"], u:300, v:[15,1.2,2,1,0.2]},
  {k:["concombre"], u:300, v:[12,0.6,2,1.7,0.1]},
  {k:["carotte"], u:100, v:[35,0.8,7,5,0.2]},
  {k:["champignon"], v:[25,3,2,1,0.3]},
  {k:["chou-fleur","chou fleur","chou chinois","chou"], u:800, v:[28,1.8,4,2.5,0.2]},
  {k:["poireau"], u:150, v:[30,1.5,5,3,0.2]},
  {k:["fenouil"], u:250, v:[20,1.2,3,2.5,0.2]},
  {k:["celeri"], u:400, v:[16,0.7,3,1.5,0.2]},
  {k:["betterave"], u:150, v:[43,1.6,9,7,0.2]},
  {k:["haricot vert"], v:[31,1.8,5,2,0.2]},
  {k:["petit pois","petits pois"], v:[80,5,12,5,0.4]},
  {k:["butternut","potiron","citrouille","courge"], u:1000, v:[40,1,9,4,0.1]},
  {k:["radis"], v:[16,0.7,2,1.9,0.1]},
  {k:["basilic","persil","coriandre","menthe","ciboulette","aneth","herbes"], v:[30,3,4,1,0.6]},
  {k:["curry","cumin","paprika","curcuma","cannelle","epice","ras el hanout","garam masala"], v:[300,12,40,3,14]},
  {k:["bouillon","cube"], u:10, v:[200,15,25,10,5]},
  {k:["cafe"], v:[1,0.1,0,0,0]},
  {k:["vinaigre"], v:[20,0,1,1,0]},
  {k:["sel","poivre","eau"], v:[0,0,0,0,0]}
];
function findNutri(name){
  var n = norm(name);
  for(var i=0;i<NUTRI.length;i++){
    for(var j=0;j<NUTRI[i].k.length;j++){
      if(n.indexOf(NUTRI[i].k[j])>=0) return NUTRI[i];
    }
  }
  return null;
}
function gramsFor(ing, e){
  var q = ing.q;
  switch(ing.u){
    case "g": return q;
    case "kg": return q*1000;
    case "ml": return q;
    case "cl": return q*10;
    case "l": return q*1000;
    case "c.à.s": return q*15;
    case "c.à.c": return q*5;
    case "boîtes": return q*((e&&e.boxG)||240);
    case "gousses": return q*5;
    case "sachets": return q*10;
    case "tranches": return q*40;
    case "bouquet": return q*30;
    case "pincées": return q*0.5;
    case "briques": return q*200;
    case "pots": return q*125;
    case "verres": return q*200;
    case "poignées": return q*30;
    case "filets": return q*((e&&e.u)||150);
    case "pavés": return q*((e&&e.u)||130);
    default: return q*((e&&e.u)||100);
  }
}
/* Totaux par portion : {v:[kcal,p,g,s,l], unknown:[noms]} */
function computeNutrition(r){
  var tot = [0,0,0,0,0], unknown = [], counted = 0;
  (r.ing||[]).forEach(function(ing){
    var e = findNutri(ing.n);
    if(!e){ unknown.push(ing.n); return; }
    var grams = gramsFor(ing, e);
    for(var i=0;i<5;i++) tot[i] += e.v[i]*grams/100;
    counted++;
  });
  if(!counted) return null;
  var serves = r.serves || 4;
  return {v: tot.map(function(x){ return x/serves; }), unknown: unknown};
}

/* ================= Détection vegan ================= */
var ANIMAL = ["poulet","boeuf","porc","veau","agneau","canard","dinde","lardon","bacon","jambon","saucisse","chorizo","steak","viande","merguez","volaille","saumon","cabillaud","thon","crevette","poisson","truite","dorade","colin","lieu","moule","gambas","anchois","oeuf","lait","beurre","creme","fromage","parmesan","mozzarella","feta","chevre","comte","gruyere","emmental","mascarpone","ricotta","burrata","raclette","cheddar","yaourt","skyr","miel","mayonnaise","boudoir","gelatine"];
var VEGAN_OK = /(lait|creme|beurre|yaourt|fromage)\s*(de |d')?\s*(coco|amande|soja|avoine|riz|cajou|cacahuete|arachide|vegetal)/;
function isVeganList(ings){
  if(!ings || !ings.length) return false;
  for(var i=0;i<ings.length;i++){
    var n = norm(ings[i].n);
    if(VEGAN_OK.test(n)) continue;
    for(var j=0;j<ANIMAL.length;j++){
      if(n.indexOf(ANIMAL[j])>=0) return false;
    }
  }
  return true;
}

function parseQty(s){
  s = s.replace(",",".").trim();
  var m = s.match(/^(\d+)\s*\/\s*(\d+)$/);
  if(m) return (+m[1])/(+m[2]);
  m = s.match(/^(\d+)\s+(\d+)\s*\/\s*(\d+)$/);
  if(m) return (+m[1]) + (+m[2])/(+m[3]);
  if(s==="½") return .5;
  if(s==="¼") return .25;
  if(s==="¾") return .75;
  var f = parseFloat(s);
  return isNaN(f) ? null : f;
}
/* "400 g de spaghetti" | "2 citrons" | "1 c.à.s de miel" | "Sel" */
function parseIngredientLine(line){
  var t = line.replace(/^[\s•·\-–—*✅✔️▪️◾️]+/,"").replace(/[.;]\s*$/,"").trim();
  if(!t) return null;
  var m = t.match(/^([\d.,]+(?:\s*\/\s*\d+)?|½|¼|¾)\s*(.*)$/);
  var q = 1, rest = t;
  if(m){
    var pq = parseQty(m[1]);
    if(pq!==null){ q = pq; rest = m[2].trim(); }
  }
  var u = "";
  var words = rest.split(/\s+/);
  if(words.length>1){
    for(var i=0;i<UNITS.length;i++){
      if(UNITS[i].re.test(words[0])){
        u = UNITS[i].u;
        rest = words.slice(1).join(" ");
        break;
      }
    }
  }
  rest = rest.replace(/^(de |d'|d’)/i,"").trim();
  if(!rest) return null;
  var name = rest.charAt(0).toUpperCase()+rest.slice(1);
  return {n:name, q:q, u:u, r:guessRayon(name)};
}
/* Découpe une légende Instagram en titre / ingrédients / étapes */
function parseCaption(text){
  var lines = text.split(/\n+/).map(function(l){ return l.trim(); }).filter(Boolean);
  var out = {title:"", ing:[], steps:[]};
  if(!lines.length) return out;
  var mode = "start";
  var qtyLine = /^[\s•·\-–—*✅✔️▪️◾️]*([\d.,½¼¾]|une? )/i;
  lines.forEach(function(l){
    var low = l.toLowerCase();
    if(/ingr[eé]dients?/.test(low) && l.length<40){ mode="ing"; return; }
    if(/(pr[eé]paration|[eé]tapes?|recette\s*:|instructions?|d[eé]roul[eé])/.test(low) && l.length<40){ mode="steps"; return; }
    if(mode==="start"){
      if(!out.title && !/^[#@]/.test(l)){ out.title = l.replace(/[\p{Extended_Pictographic}️]/gu,"").replace(/!+/g,"").trim(); }
      return;
    }
    if(/^[#@]/.test(l)) return;
    if(mode==="ing"){
      var ing = parseIngredientLine(l);
      if(ing) out.ing.push(ing);
      return;
    }
    if(mode==="steps"){
      var s = l.replace(/^\d+[).:\-]\s*/,"").replace(/^[\s•·\-–—*]+/,"").trim();
      if(s) out.steps.push(s);
    }
  });
  /* Pas de section "Ingrédients" trouvée : on repère les lignes qui commencent par une quantité */
  if(!out.ing.length){
    lines.slice(1).forEach(function(l){
      if(qtyLine.test(l)){
        var ing = parseIngredientLine(l);
        if(ing) out.ing.push(ing);
      }
    });
  }
  return out;
}

/* ================= État ================= */
var recipes = loadRecipes();
var firstRun = recipes===null;
if(firstRun){ recipes = demoRecipes(); saveRecipes(); }

var persisted = loadState();
var state = {
  tag:"Toutes", q:"",
  selected: persisted.selected || {},
  checked: persisted.checked || {},
  list: persisted.list || null,
  detailId:null, detailServes:0,
  editId:null
};
/* purge les sélections de recettes supprimées */
Object.keys(state.selected).forEach(function(id){ if(!byId(id)) delete state.selected[id]; });

var $ = function(id){ return document.getElementById(id); };
var esc = function(s){ return String(s==null?"":s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c]; }); };

function fmtQty(q,u){
  var n = Math.round(q*100)/100;
  return u ? (n+" "+u) : String(n);
}
function selCount(){ return Object.keys(state.selected).length; }
function byId(id){ for(var i=0;i<recipes.length;i++){ if(String(recipes[i].id)===String(id)) return recipes[i]; } return null; }
function newId(){ return "r"+Date.now().toString(36)+Math.random().toString(36).slice(2,6); }

/* ================= Livre ================= */
function renderChips(){
  var all = ["Toutes"].concat(TAGS);
  $("chips").innerHTML = all.map(function(t){
    return '<button class="chip'+(state.tag===t?" on":"")+'" data-tag="'+t+'">'+t+'</button>';
  }).join("");
}
function renderBook(){
  var q = state.q.toLowerCase();
  var shown = recipes.filter(function(r){
    var okTag = state.tag==="Toutes" || (r.tags||[]).indexOf(state.tag)>=0;
    var okQ = !q || r.title.toLowerCase().indexOf(q)>=0 || (r.handle||"").toLowerCase().indexOf(q)>=0;
    return okTag && okQ;
  });
  $("grid").innerHTML = shown.map(function(r){
    var sel = state.selected[r.id];
    var meta = [];
    if(r.handle) meta.push('<span class="handle">'+esc(r.handle)+'</span>');
    if(r.time) meta.push('<span>'+r.time+' min</span>');
    if((r.tags||[]).indexOf("Vegan")>=0) meta.push('<span title="Vegan">🌱</span>');
    return '<article class="rcard'+(sel?" sel":"")+'" data-id="'+esc(r.id)+'" tabindex="0" role="button" aria-label="'+esc(r.title)+'">'
      + '<div class="photo" style="background:linear-gradient(135deg,'+r.grad[0]+','+r.grad[1]+');">'+esc(r.emoji||"🍽️")+'</div>'
      + '<div class="body"><h3 class="serif">'+esc(r.title)+'</h3>'
      + '<div class="meta">'+meta.join("<span>·</span>")+'</div></div>'
      + '<button class="tick" data-sel="'+esc(r.id)+'" aria-label="Sélectionner pour la liste de courses">✓</button>'
      + '</article>';
  }).join("");
  var empty = $("bookEmpty");
  if(!recipes.length){
    empty.hidden = false;
    empty.innerHTML = 'Ton carnet est vide.<br>Appuie sur <strong>+</strong> pour ajouter ta première recette Instagram 🍳';
  }else if(!shown.length){
    empty.hidden = false;
    empty.innerHTML = 'Aucune recette ne correspond.<br>Essaie un autre mot ou un autre filtre.';
  }else{
    empty.hidden = true;
  }
  $("count").textContent = recipes.length + (recipes.length>1 ? " recettes" : " recette");
  renderSelbar();
}
function renderSelbar(){
  var n = selCount();
  $("selbar").classList.toggle("on", n>0 && $("view-book").classList.contains("on"));
  $("selTxt").textContent = n + (n>1 ? " recettes choisies" : " recette choisie");
  $("listBadge").classList.toggle("on", n>0);
  $("listBadge").textContent = n;
}

/* ================= Liste de courses ================= */
function buildList(){
  var agg = {};
  Object.keys(state.selected).forEach(function(id){
    var r = byId(id); if(!r) return;
    (r.ing||[]).forEach(function(ing){
      var k = ing.n.toLowerCase()+"|"+ing.u;
      if(!agg[k]) agg[k] = {n:ing.n, u:ing.u, r:ing.r||"Autre", q:0, from:[]};
      agg[k].q += ing.q;
      if(agg[k].from.indexOf(r.title)<0) agg[k].from.push(r.title);
    });
  });
  var groups = {};
  Object.keys(agg).forEach(function(k){
    var it = agg[k];
    (groups[it.r] = groups[it.r] || []).push(it);
  });
  Object.keys(groups).forEach(function(g){
    groups[g].sort(function(a,b){ return a.n.localeCompare(b.n,"fr"); });
  });
  state.list = {groups:groups, nbRecipes:selCount(), nbItems:Object.keys(agg).length};
  state.checked = {};
  saveState();
}
function renderList(){
  var w = $("listWrap");
  if(!state.list || state.list.nbRecipes===0){
    w.innerHTML = '<div class="list-head"><h2 class="serif">Ma liste de courses</h2></div>'
      + '<div class="empty">Ta liste est vide pour l’instant.<br>Choisis des recettes dans ton livre et elle se remplit toute seule 🧺'
      + '<br><button class="btn" id="goBook" style="display:inline-block;margin-top:16px;padding:12px 22px;">Ouvrir mon livre</button></div>';
    var gb = $("goBook"); if(gb) gb.addEventListener("click", function(){ switchTab("book"); });
    return;
  }
  var html = '<div class="list-head"><h2 class="serif">Ma liste de courses</h2>'
    + '<div class="list-sub">'+state.list.nbRecipes+' recettes · '+state.list.nbItems+' ingrédients — quantités additionnées. <a id="editSel">Modifier</a></div></div>';
  RAYONS.forEach(function(rayon){
    var items = state.list.groups[rayon];
    if(!items || !items.length) return;
    html += '<div class="rayon"><div class="rayon-label">'+rayon+'</div>';
    items.forEach(function(it){
      var k = it.n.toLowerCase()+"|"+it.u;
      var done = state.checked[k] ? " done" : "";
      html += '<button class="item'+done+'" data-k="'+esc(k)+'">'
        + '<span class="box">✓</span>'
        + '<span class="txt"><span class="name">'+esc(it.n)+'</span><span class="from">Pour : '+esc(it.from.join(" · "))+'</span></span>'
        + '<span class="qty">'+fmtQty(it.q,it.u)+'</span></button>';
    });
    html += '</div>';
  });
  html += '<div class="list-actions"><button class="btn ghost" id="editSel2">← Mes recettes</button><button class="btn" id="shareList">Partager</button></div>';
  w.innerHTML = html;

  w.querySelectorAll(".item").forEach(function(el){
    el.addEventListener("click", function(){
      var k = el.getAttribute("data-k");
      state.checked[k] = !state.checked[k];
      el.classList.toggle("done", !!state.checked[k]);
      saveState();
    });
  });
  var e1=$("editSel"), e2=$("editSel2");
  if(e1) e1.addEventListener("click", function(){ switchTab("book"); });
  if(e2) e2.addEventListener("click", function(){ switchTab("book"); });
  $("shareList").addEventListener("click", shareList);
}
function listAsText(){
  var lines = ["Liste de courses ("+state.list.nbRecipes+" recettes)"];
  RAYONS.forEach(function(rayon){
    var items = state.list.groups[rayon]; if(!items || !items.length) return;
    lines.push("");
    lines.push("— "+rayon+" —");
    items.forEach(function(it){ lines.push("· "+it.n+" : "+fmtQty(it.q,it.u)); });
  });
  return lines.join("\n");
}
function shareList(){
  var txt = listAsText();
  if(navigator.share){
    navigator.share({title:"Liste de courses", text:txt}).catch(function(){});
  }else if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(txt).then(function(){ toast("Liste copiée ✓"); },
      function(){ toast("Impossible de copier la liste"); });
  }else{
    toast("Partage non disponible sur ce navigateur");
  }
}

/* ================= Onglets ================= */
function switchTab(tab){
  var book = tab==="book";
  $("view-book").classList.toggle("on", book);
  $("bookHead").style.display = book ? "" : "none";
  $("view-list").classList.toggle("on", !book);
  $("tabBook").classList.toggle("on", book);
  $("tabList").classList.toggle("on", !book);
  if(!book) renderList();
  renderSelbar();
}

/* ================= Fiche recette ================= */
function openDetail(id){
  var r = byId(id); if(!r) return;
  state.detailId = id;
  state.detailServes = r.serves || 4;
  renderDetail();
  openSheet("detailSheet");
}
function renderDetail(){
  var r = byId(state.detailId); if(!r) return;
  var scale = state.detailServes / (r.serves||4);
  var sel = !!state.selected[r.id];
  var meta = [];
  if(r.handle) meta.push('<span class="handle">'+esc(r.handle)+'</span>');
  if(r.time) meta.push('<span>⏱ '+r.time+' min</span>');
  if(r.tags && r.tags.length) meta.push('<span>'+r.tags.join(" · ")+'</span>');
  var html = '<div class="hero" style="background:linear-gradient(135deg,'+r.grad[0]+','+r.grad[1]+');">'+esc(r.emoji||"🍽️")+'</div>'
    + '<h2 class="serif">'+esc(r.title)+'</h2>'
    + '<div class="meta-row">'+meta.join("")+'</div>'
    + '<div class="stepper"><span class="lab">Portions</span>'
    + '<button id="minus" aria-label="Moins de portions">−</button>'
    + '<span class="n">'+state.detailServes+' pers.</span>'
    + '<button id="plus" aria-label="Plus de portions">+</button></div>';
  if(r.ing && r.ing.length){
    html += '<div class="sec-label">Ingrédients</div>';
    r.ing.forEach(function(ing){
      html += '<div class="ing"><span>'+esc(ing.n)+'</span><span class="q">'+fmtQty(ing.q*scale, ing.u)+'</span></div>';
    });
    var nut = computeNutrition(r);
    if(nut){
      var f1 = function(x){ return Math.round(x*10)/10; };
      html += '<div class="sec-label">Nutrition · par portion (estimation)</div>'
        + '<div class="nutri">'
        + '<div class="nbox main"><b>'+Math.round(nut.v[0])+'</b><span>kcal</span></div>'
        + '<div class="nbox"><b>'+f1(nut.v[1])+'</b><span>protéines (g)</span></div>'
        + '<div class="nbox"><b>'+f1(nut.v[2])+'</b><span>glucides (g)</span></div>'
        + '<div class="nbox"><b>'+f1(nut.v[3])+'</b><span>dont sucres (g)</span></div>'
        + '<div class="nbox"><b>'+f1(nut.v[4])+'</b><span>lipides (g)</span></div>'
        + '</div>';
      if(nut.unknown.length) html += '<div class="nutri-note">Non compté (aliment inconnu) : '+esc(nut.unknown.join(", "))+'</div>';
    }
  }
  if(r.steps && r.steps.length){
    html += '<div class="sec-label">Préparation</div>';
    r.steps.forEach(function(s,i){
      html += '<div class="step"><span class="no">'+(i+1)+'</span><span>'+esc(s)+'</span></div>';
    });
  }
  html += '<div class="sheet-actions">';
  if(r.url) html += '<a class="btn ghost" style="text-decoration:none;" href="'+esc(r.url)+'" target="_blank" rel="noopener">Voir le reel ↗</a>';
  html += '<button class="btn" id="toggleSel">'+(sel ? "Retirer de ma liste" : "Ajouter à ma liste")+'</button></div>'
    + '<div class="sheet-actions">'
    + '<button class="btn ghost" id="editRecipe">✏️ Modifier</button>'
    + '<button class="btn danger" id="deleteRecipe">Supprimer</button></div>';
  $("detailBody").innerHTML = html;

  $("minus").addEventListener("click", function(){ if(state.detailServes>1){ state.detailServes--; renderDetail(); } });
  $("plus").addEventListener("click", function(){ if(state.detailServes<20){ state.detailServes++; renderDetail(); } });
  $("toggleSel").addEventListener("click", function(){
    toggleSelect(r.id);
    renderDetail();
  });
  $("editRecipe").addEventListener("click", function(){ openEdit(r.id); });
  $("deleteRecipe").addEventListener("click", function(){
    if(!confirm('Supprimer « '+r.title+' » de ton carnet ?')) return;
    recipes = recipes.filter(function(x){ return String(x.id)!==String(r.id); });
    delete state.selected[r.id];
    if(state.list) buildList();
    saveRecipes(); saveState();
    closeSheets(); renderBook();
    toast("Recette supprimée");
  });
}
function toggleSelect(id){
  if(state.selected[id]) delete state.selected[id]; else state.selected[id]=true;
  if(state.list) buildList();
  saveState();
  renderBook();
}

/* ================= Formulaire recette ================= */
function renderTagPick(selected){
  $("edTags").innerHTML = TAGS.map(function(t){
    return '<button class="chip'+(selected.indexOf(t)>=0?" on":"")+'" data-t="'+t+'">'+t+'</button>';
  }).join("");
}
function openEdit(id, prefill){
  state.editId = id || null;
  var r = id ? byId(id) : null;
  $("editTitle").textContent = r ? "Modifier la recette" : "Nouvelle recette";
  $("edTitle").value = r ? r.title : (prefill && prefill.title || "");
  $("edHandle").value = r ? (r.handle||"") : (prefill && prefill.handle || "");
  $("edTime").value = r && r.time ? r.time : "";
  $("edServes").value = r ? (r.serves||4) : 4;
  $("edEmoji").value = r ? (r.emoji||"") : "";
  $("edUrl").value = r ? (r.url||"") : (prefill && prefill.url || "");
  renderTagPick(r ? (r.tags||[]) : []);
  var ingLines = (r ? r.ing : (prefill && prefill.ing) || []).map(function(i){
    var de = /^[aeiouyàâéèêëîïôöûüœ]/i.test(i.n) ? "d'" : "de ";
    return (i.q!==1||i.u ? fmtQty(i.q,i.u)+" " : "") + (i.u ? de : "") + i.n;
  });
  $("edIng").value = ingLines.join("\n");
  $("edSteps").value = (r ? r.steps : (prefill && prefill.steps) || []).join("\n");
  openSheet("editSheet");
}
function saveEdit(){
  var title = $("edTitle").value.trim();
  if(!title){ toast("Il manque le titre de la recette"); $("edTitle").focus(); return; }
  var handle = $("edHandle").value.trim();
  if(handle && handle.charAt(0)!=="@") handle = "@"+handle;
  var tags = [];
  $("edTags").querySelectorAll(".chip.on").forEach(function(c){ tags.push(c.getAttribute("data-t")); });
  var ing = $("edIng").value.split("\n").map(parseIngredientLine).filter(Boolean);
  var steps = $("edSteps").value.split("\n").map(function(s){ return s.replace(/^\d+[).:\-]\s*/,"").trim(); }).filter(Boolean);
  var veganAuto = false;
  if(isVeganList(ing) && tags.indexOf("Vegan")<0){ tags.push("Vegan"); veganAuto = true; }
  var existing = state.editId ? byId(state.editId) : null;
  var rec = existing || {id:newId(), grad:GRADS[recipes.length % GRADS.length]};
  rec.title = title;
  rec.handle = handle;
  rec.url = $("edUrl").value.trim();
  rec.time = parseInt($("edTime").value,10) || 0;
  rec.serves = parseInt($("edServes").value,10) || 4;
  rec.emoji = $("edEmoji").value.trim() || "🍽️";
  rec.tags = tags;
  rec.ing = ing;
  rec.steps = steps;
  if(!existing) recipes.unshift(rec);
  saveRecipes();
  if(state.selected[rec.id] && state.list) buildList();
  closeSheets();
  renderBook();
  var msg = existing ? "Recette mise à jour ✓" : "Recette ajoutée ✓";
  if(veganAuto) msg += " · 🌱 aucun produit animal détecté, taguée Vegan";
  toast(msg);
}

/* ================= Import Instagram ================= */
/* Reçoit un partage Android « Instagram → Partager → Mes Recettes » */
function handleShareTarget(){
  try{
    var sp = new URLSearchParams(location.search);
    var text = sp.get("text")||"", url = sp.get("url")||"", title = sp.get("title")||"";
    if(!text && !url && !title) return;
    history.replaceState(null, "", location.pathname);
    var all = (title+"\n"+text+"\n"+url).trim();
    var m = all.match(/https?:\/\/\S+/);
    $("impUrl").value = m ? m[0] : "";
    var caption = all.replace(/https?:\/\/\S+/g,"").trim();
    $("impCaption").value = caption;
    openSheet("importSheet");
    if(m && !caption) toast("Lien reçu ✓ — copie aussi la légende du post pour extraire la recette");
  }catch(e){}
}
function setupImport(){
  $("addBtn").addEventListener("click", function(){
    $("impUrl").value = ""; $("impCaption").value = "";
    openSheet("importSheet");
  });
  $("impManual").addEventListener("click", function(){
    var url = $("impUrl").value.trim();
    openEdit(null, {url:url});
  });
  $("impPaste").addEventListener("click", function(){
    if(navigator.clipboard && navigator.clipboard.readText){
      navigator.clipboard.readText().then(function(t){
        t = (t||"").trim();
        if(!t){ toast("Rien dans le presse-papiers — copie d'abord la légende dans Instagram"); return; }
        var m = t.match(/https?:\/\/\S+/);
        if(m && !$("impUrl").value) $("impUrl").value = m[0];
        var rest = t.replace(/https?:\/\/\S+/g,"").trim();
        if(rest) $("impCaption").value = rest;
        toast(rest ? "Collé ✓ — appuie sur Analyser ✨" : "Lien collé ✓ — copie aussi la légende pour extraire la recette");
      }, function(){
        toast("Autorise l'accès au presse-papiers, ou colle à la main dans les champs");
      });
    }else{
      toast("Colle à la main dans les champs (appui long → Coller)");
    }
  });
  $("impParse").addEventListener("click", function(){
    var url = $("impUrl").value.trim();
    var caption = $("impCaption").value.trim();
    if(!caption && !url){ toast("Colle au moins le lien ou la légende"); return; }
    var parsed = caption ? parseCaption(caption) : {title:"",ing:[],steps:[]};
    parsed.url = url;
    openEdit(null, parsed);
    if(caption && parsed.ing.length) toast(parsed.ing.length+" ingrédients détectés — vérifie et enregistre");
    else if(caption) toast("Légende lue — complète les ingrédients");
  });
}

/* ================= Sheets, overlay, toast ================= */
var SHEETS = ["detailSheet","importSheet","editSheet"];
var sheetInHistory = false;
function openSheet(id){
  $("overlay").classList.add("on");
  SHEETS.forEach(function(s){
    var el = $(s), on = s===id;
    el.classList.toggle("on", on);
    if(on) el.scrollTop = 0;
  });
  /* le bouton retour du téléphone ferme la fiche au lieu de quitter l'appli */
  if(!sheetInHistory){
    try{ history.pushState({sheet:true}, ""); sheetInHistory = true; }catch(e){}
  }
}
function closeSheets(fromHistory){
  $("overlay").classList.remove("on");
  SHEETS.forEach(function(s){ $(s).classList.remove("on"); });
  if(sheetInHistory){
    sheetInHistory = false;
    if(!fromHistory){ try{ history.back(); }catch(e){} }
  }
}
window.addEventListener("popstate", function(){
  if(sheetInHistory) closeSheets(true);
});
/* glisser vers le bas sur le haut d'une fiche pour la fermer */
function setupSwipeClose(){
  SHEETS.forEach(function(s){
    var el = $(s), startY = null;
    el.addEventListener("touchstart", function(e){
      startY = (el.scrollTop<=0) ? e.touches[0].clientY : null;
    }, {passive:true});
    el.addEventListener("touchmove", function(e){
      if(startY===null) return;
      var dy = e.touches[0].clientY - startY;
      if(dy>0 && el.scrollTop<=0) el.style.transform = "translateY("+dy+"px)";
    }, {passive:true});
    el.addEventListener("touchend", function(e){
      if(startY===null) return;
      var dy = e.changedTouches[0].clientY - startY;
      el.style.transform = "";
      if(dy>80) closeSheets();
      startY = null;
    });
  });
}
var toastTimer = null;
function toast(msg){
  var t = $("toast");
  t.textContent = msg;
  t.classList.add("on");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function(){ t.classList.remove("on"); }, 2600);
}

/* ================= Événements ================= */
function setup(){
  renderChips(); renderBook();

  $("chips").addEventListener("click", function(e){
    var b = e.target.closest(".chip"); if(!b) return;
    state.tag = b.getAttribute("data-tag");
    renderChips(); renderBook();
  });
  $("q").addEventListener("input", function(e){ state.q = e.target.value; renderBook(); });

  $("grid").addEventListener("click", function(e){
    var tick = e.target.closest(".tick");
    if(tick){ toggleSelect(tick.getAttribute("data-sel")); return; }
    var card = e.target.closest(".rcard");
    if(card) openDetail(card.getAttribute("data-id"));
  });
  $("grid").addEventListener("keydown", function(e){
    if(e.key!=="Enter" && e.key!==" ") return;
    var card = e.target.closest(".rcard"); if(!card) return;
    e.preventDefault(); openDetail(card.getAttribute("data-id"));
  });

  $("genBtn").addEventListener("click", function(){ buildList(); switchTab("list"); });
  $("clearSel").addEventListener("click", function(){
    state.selected={}; state.list=null; saveState(); renderBook();
  });

  $("tabBook").addEventListener("click", function(){ switchTab("book"); });
  $("tabList").addEventListener("click", function(){
    if(!state.list && selCount()>0) buildList();
    switchTab("list");
  });

  $("edTags").addEventListener("click", function(e){
    var c = e.target.closest(".chip"); if(!c) return;
    c.classList.toggle("on");
  });
  $("edSave").addEventListener("click", saveEdit);
  $("edCancel").addEventListener("click", closeSheets);

  $("overlay").addEventListener("click", function(){ closeSheets(); });
  document.addEventListener("keydown", function(e){ if(e.key==="Escape") closeSheets(); });
  document.querySelectorAll(".sheet-close").forEach(function(b){
    b.addEventListener("click", function(){ closeSheets(); });
  });
  setupSwipeClose();

  setupImport();
  handleShareTarget();

  if(firstRun){
    setTimeout(function(){
      toast("Bienvenue ! 5 recettes d'exemple sont là pour essayer — supprime-les quand tu veux.");
    }, 600);
  }
}
setup();

/* ================= PWA ================= */
if("serviceWorker" in navigator && location.protocol!=="file:"){
  window.addEventListener("load", function(){
    navigator.serviceWorker.register("sw.js").catch(function(){});
  });
}
})();
