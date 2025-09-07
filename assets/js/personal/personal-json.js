// ==== JSON (importa staff.json) ====
(async function seedPersonalFromJson(){
  const KEY = "personal_json";
  if (!localStorage.getItem(KEY)) {
    const respuesta = await fetch("assets/json/personal.json"); 
    const listaPersonal = await respuesta.json();
    
    const pers_norm = listaPersonal.map(pers => ({ ...pers, rut: String(pers.rut).trim(), dv: String(pers.dv).trim() }));
    localStorage.setItem(KEY, JSON.stringify(pers_norm));
    console.log("Personal importado desde staff.json:", pers_norm);
  }
})();

