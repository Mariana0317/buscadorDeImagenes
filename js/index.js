const resultado = document.querySelector("#resultado");
const formulario = document.querySelector("#formulario");
const paginacionDiv = document.querySelector("#paginacion");

const registrosPorPagina = 40;
let totalPaginas;
let iterador;
let paginaActual = 1; //para quse la primera vez que se mande a llamar una consulta a la api traiga la pagina uno

window.onload = () => {
  //aqui estamos registrando el submit para el formulario yluego validamos el formulario
  formulario.addEventListener("submit", validarFormulario);
};

function validarFormulario(e) {
  e.preventDefault();
  const terminoBusqueda = document.querySelector("#termino").value;

  if (terminoBusqueda === "") {
    mostrarAlerta("agrega un termino de busqueda");
    return;
  }
  //una vez que esta validado y no hay errores se ejecuta el codigo para teaer de la api la información
  buscarImagenes(); //llamamos a la funcion que va consultar a la api
}

async function buscarImagenes() {
  //♥♥ pasamos a ASYNC AWAIT primero hacemos la funcion padre asincrona colocando async adleante de la funcion

  const termino = document.querySelector("#termino").value; //y tomamos el valor de lo que el ususario haya escrito en el input

  const key = "19508234-c392daed3f0a6012c0cdf097a"; //le padamos la key que gruadamos en una variable
  const url = `https://pixabay.com/api/?key=${key}&q=${termino}&per_page=${registrosPorPagina}&page=${paginaActual} `; //y tambien guardamos la url en una variable la url le ponemos un template string para poder inyectarle las variables

  /*fetch(url) //hcemos el fetch para consultar la api
    .then((respuesta) => respuesta.json())
    .then((resultado) => {
      console.log(resultado);
      totalPaginas = clacularPaginas(resultado.totalHits); //calculamos las paginas de forma dinamica que va a depende de la cantidad del resutados encontrados

      mostrarImagenes(resultado.hits); //funcion que se va encargar de tomar el resultado de calcularPaginas y mostrarlo en el html
    });*/ //♥♥ este codigo es lo mismo que lo que tenemos en con async await ♥♥

  //♥♥ antes de cerrar la funcion ponemos un try catch
  try {
    const respuesta = await fetch(url);
    const resultado = await respuesta.json(); //♥♥ esperamos una respuesta en json y se va asignar al resultado... este await va a bloquear la ejecucion de codigo por lo tanto el codigo que sigue no se va ejecutar hasta que se haya completado esta linea
    totalPaginas = clacularPaginas(resultado.totalHits); //calculamos las paginas de forma dinamica que va a depende de la cantidad del resutados encontrados
    mostrarImagenes(resultado.hits); //funcion que se va encargar de tomar el resultado de calcularPaginas y mostrarlo en el html
  } catch (error) {
    console.log(error);
  }
}
//generador que va registrar la cantidad de elementos de acuerdo a las paginas, el generador registra cuantas paginas va haber va a iterar sobre todo los registros y va a decir cundo a llegado al final
function* crearPaginador(total) {
  //un generador se define con un asterisco
  for (let i = 0; i <= total; i++) {
    yield i;
  }
}
function clacularPaginas(total) {
  //esta funcion toma el total y lo divide entre el numero de registros y luego mostramos las imgenes
  return parseInt(Math.ceil(total / registrosPorPagina)); //va a ser dinamico de acuerdo al resultado que nos de la api
}

function mostrarImagenes(imagenes) {
  //console.log(imagenes);
  while (resultado.firstChild) {
    //primero limpia el html
    resultado.removeChild(resultado.firstChild);
  }
  //iterar sobre el arrreblo de imagenes y construir el html
  imagenes.forEach((imagen) => {
    //recorre tode el arreglo
    const { previewURL, likes, views, largeImageURL } = imagen;

    resultado.innerHTML += `
        <div class="w-1/2 md:w-1/3 lg:w-1/4 p-3 mb-4">
        <div class="bg-white">
        <img class="w-full" src="${previewURL}">
        <div class="p-4">
        <p class="font-bold">${likes} <span class="font-light"> Me gusta </span> </p>
        <p class="font-bold">${views} <span class="font-light"> Veces Vista </span> </p>

        <a 
        class="block w-full bg-pink-300 hover:bg-pink-500 text-white uppercase font-bold text-center rounded mt-5 p-1"
        href="${largeImageURL}" target="_blank" rel="noopener noreferr">
        Ver Imagen
        </a>
        </div>
        </div>
        </div>
        `;
    //con el html va mostrando todos los resultados
  });

  //limpiar paginador previo del html
  while (paginacionDiv.firstChild) {
    paginacionDiv.removeChild(paginacionDiv.firstChild);
  }
  //y aqui generamos un nuevo html
  imprimirPaginador();
}

function imprimirPaginador() {
  //estas funcion va a ir generando html mientra no hayamos llegado al final del generador
  iterador = crearPaginador(totalPaginas);
  console.log(iterador.next().done); //.next() hace que le generador se despierte y despues sse vuelva  dormir salga del suspended

  while (true) {
    const { value, done } = iterador.next(); //con next() se despierta el iterador
    if (done) return; //si llegamos al final no ejecutes nada
    //caso contrario genera un boton por cada elemento en el generador
    const boton = document.createElement("a");
    boton.href = "#";
    boton.dataset.pagina = value;
    boton.textContent = value;
    boton.classList.add(
      "siguiente",
      "bg-pink-300",
      "px-4",
      "py-1",
      "mr-2",
      "font-bold",
      "mb-4",
      "rounded"
    );
    boton.onclick = () => {
      paginaActual = value;

      console.log(paginaActual);
      buscarImagenes();
    };

    paginacionDiv.appendChild(boton); //se va agregar el boton en cada pagina mientras la condicion sea true, cuando llegamos al final deja de ejcutarse el generador o sea cuando sea false
  }
}

function mostrarAlerta(mensaje) {
  const existeAlerta = document.querySelector(".bg-red-100");
  if (!existeAlerta) {
    //aqui dice si no existe una alerta entonces agrega uno
    const alerta = document.createElement("p");

    alerta.classList.add(
      "bg-red-100",
      "border-red-400",
      "text-red-700",
      "px-4",
      "py-3",
      "rounded",
      "max-w-lg",
      "mx-auto",
      "mt-6",
      "text-center"
    );
    alerta.innerHTML = `
      <strong class="font-bold">Error!</strong>
      <span class="block sm:inline">${mensaje}</span>
      `;

    formulario.appendChild(alerta);

    setTimeout(() => {
      alerta.remove();
    }, 3000);
  }
}
