(() => {
  const form = document.getElementById('studentForm');
  const tableBody = document.querySelector('#studentsTable tbody');
  const clearAllBtn = document.getElementById('clearAll');

  const patterns = {
    cedula: /^\d{5,12}$/,
    name: /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{2,50}$/, 
    direccion: /^[A-Za-z0-9ÁÉÍÓÚáéíóúÑñ#\-\.,\s]{5,100}$/, 
    telefono: /^[0-9\-\s]{7,15}$/, 
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, 
    paralelo: /^[A-Za-z0-9]{1,5}$/
  };

  function getStudents(){
    try{ return JSON.parse(localStorage.getItem('estudiantes')||'[]') }catch(e){return[]}
  }

  function saveStudents(list){
    localStorage.setItem('estudiantes', JSON.stringify(list));
  }

  function render(){
    const students = getStudents();
    tableBody.innerHTML = '';
    students.forEach((s, i) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${s.cedula}</td>
        <td>${s.apellidos}</td>
        <td>${s.nombres}</td>
        <td>${s.facultad}</td>
        <td>${s.nivel}</td>
        <td>${s.paralelo || ''}</td>
        <td><button data-i="${i}" class="del">Eliminar</button></td>
      `;
      tableBody.appendChild(tr);
    });
  }

  function showError(id, msg){
    document.getElementById('err-'+id).textContent = msg || '';
  }

  function validate(values){
    let ok = true;
    // cedula
    if(!patterns.cedula.test(values.cedula)){
      showError('cedula','Cédula inválida (5-12 dígitos)'); ok = false;
    } else showError('cedula','');

    if(!patterns.name.test(values.apellidos)){
      showError('apellidos','Apellidos inválidos'); ok = false;
    } else showError('apellidos','');

    if(!patterns.name.test(values.nombres)){
      showError('nombres','Nombres inválidos'); ok = false;
    } else showError('nombres','');

    if(values.direccion && !patterns.direccion.test(values.direccion)){
      showError('direccion','Dirección inválida'); ok = false;
    } else showError('direccion','');

    if(values.telefono && !patterns.telefono.test(values.telefono)){
      showError('telefono','Teléfono inválido'); ok = false;
    } else showError('telefono','');

    if(values.email && !patterns.email.test(values.email)){
      showError('email','Correo inválido'); ok = false;
    } else showError('email','');

    if(!values.facultad){ showError('facultad','Seleccione una facultad'); ok = false } else showError('facultad','');
    if(!values.nivel){ showError('nivel','Seleccione un nivel'); ok = false } else showError('nivel','');

    if(values.paralelo && !patterns.paralelo.test(values.paralelo)){
      showError('paralelo','Paralelo inválido'); ok = false;
    } else showError('paralelo','');

    return ok;
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    const values = {
      cedula: form.cedula.value.trim(),
      apellidos: form.apellidos.value.trim(),
      nombres: form.nombres.value.trim(),
      direccion: form.direccion.value.trim(),
      telefono: form.telefono.value.trim(),
      email: form.email.value.trim(),
      facultad: form.facultad.value,
      nivel: form.nivel.value,
      paralelo: form.paralelo.value.trim()
    };

    if(!validate(values)) return;

    const students = getStudents();
    // evita duplicados por cédula
    const exists = students.some(s => s.cedula === values.cedula);
    if(exists){ showError('cedula','Ya existe un estudiante con esa cédula'); return }

    students.push(values);
    saveStudents(students);
    render();
    form.reset();
  });

  tableBody.addEventListener('click', e => {
    if(e.target.classList.contains('del')){
      const i = Number(e.target.dataset.i);
      const list = getStudents();
      list.splice(i,1);
      saveStudents(list);
      render();
    }
  });

  clearAllBtn.addEventListener('click', () => {
    if(confirm('Borrar todos los registros?')){
      localStorage.removeItem('estudiantes');
      render();
    }
  });

  // inicializar
  render();
})();