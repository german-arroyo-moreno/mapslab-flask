"use strict";
////////////////////////////////////////////////////////////////////////////////////
/////////     1.ELEMENTOS COMUNES A TODA LA APLICACIÓN      ////////////////////////
////////////////////////////////////////////////////////////////////////////////////

/************************************************ */
// TIPO ENUMERADO PARA LOS COLORES DE LOS ELEMENTOS
var ElementColor = {
    As: [240,50,230, 255],
    Ba: [60,180,75, 255],
    Ca: [255,255,25, 255],
    Cd: [0,130,200, 255],
    Co: [245,130,48, 255],
    Cr: [145,30,180, 255],
    Cu: [70,240,240, 255],
    Fe: [230,25,75, 255],
    Hg: [210,245,60, 255],
    K: [0,128,128, 255],
    Mn: [220,190,255, 255],
    Ni: [170,110,40, 255],
    Pb: [128,0,0, 255],
    Sb: [170,255,195, 255],
    Se: [128,128,0, 255],
    Sn: [0,0,128, 255],
    Ti: [255,215,180, 255],
    Zn: [60,180,75, 255]
}

/************************************************ */
// CLASES PARA LOS TIPOS DE CAPAS (LAYERS)
// Clase padre para crear la capa del fondo (base)
class BackgroundLayer {
    constructor(name) {
        this.name = name;
    }
}
// Clase para crear capas auxiliares
class AuxiliaryLayer extends BackgroundLayer {
    // Atributos de la clase de las capas auxiliares
    static DataTypePrint = {
        Integer: "integer",
        Float: "float",
        Scientific: "scientific",
        PerCent: "percent"
    };

    static InterpolationType = {
        MinHypercubeDistance: "min-hypercube-distance",
        MinCartesianDistance: "min-cartesian-distance",
        RBG: "rbf",
        Triangulation: "triangulation"
    };

    static PosNormalization = {
        Homogeneous: "homogeneous",
        Heterogeneous: "heterogeneous"
    };

    static Probe = {
        1: "1x1",
        3: "3x3",
        5: "5x5",
        7: "7x7",
        9: "9x9",
        11: "11x11",
        13: "13x13",
        15: "15x15",
        25: "25x25",
        49: "49x49"
    };

    static Palette = {
        Discrete_tone_2_interval: "disc-tone-2",
        Discrete_tone_3_interval: "disc-tone-3",
        Discrete_tone_4_interval: "disc-tone-4",
        Discrete_tone_5_interval: "disc-tone-5",
        Discrete_color_2_interval: "disc-color-2",
        Discrete_color_3_interval: "disc-color-3",
        Discrete_color_4_interval: "disc-color-4",
        Discrete_color_5_interval: "disc-color-5",
        Continuous_color_1_interval: "cont-color-1",
        Continuous_color_2_interval: "cont-color-2",
        Continuous_color_3_interval: "cont-color-3",
        Continuous_color_4_interval: "cont-color-4",
        Continuous_color_5_interval: "cont-color-5",
        Continuous_tone_2_interval: "cont-tone-2",
        Continuous_tone_3_interval: "cont-tone-3",
        Continuous_tone_4_interval: "cont-tone-4",
        Continuous_tone_5_interval: "cont-tone-5"
    };

    // Constructor de la clase Layer
    constructor(name, element, interpolation, normalization, pos_normalization, probe, palette) {
        super(name);
        this.element = element;
        this.color = ElementColor[element];
        this.InterpolationType = interpolation;
        this.normalization = normalization; // true or false
        this.PosNormalization = pos_normalization;
        this.Probe = probe;
        this.Palette = palette;

        // Atributos iniciales manipulables en la pestaña Layers
        this.transparency = 0;
        this.min_threshold = 0;
        this.max_threshold = 1;
        this.data_type_print = AuxiliaryLayer.DataTypePrint.Integer;
    }
}

// Clase para crear capas de tipo Difference of Gaussians
class DOGLayer extends BackgroundLayer {
    // Atributos de la clase Difference of Gaussians
    constructor (name, pixel_transparency) {
        super(name);
        this.pixel_transparency = pixel_transparency; // true or false
        this.gaussian_threshold = 250;
        this.big_gaussian_size = 25;
        this.small_gaussian_size = 13;
    }
}

/************************************************ */
// FUNCIONES PARA CREAR TODOS LOS TIPOS DE BOTONES DE LA APLICACIÓN

// Función auxiliar para transformar string en HTML
function htmlToElement(html) {
    let template = document.createElement('template');
    template.innerHTML = html.trim();
    return template.content.firstChild;
}

// FUNCIÓN PARA CREAR ELEMENTO DE TIPO botón
function createHtmlBoton (name, otherClasses=" ", id=" ", onclick=" ") {
    // Crear botón (Creando todo el html directamente con función auxiliar)
    var newBotonString =  `<button onclick="${onclick}" class="${otherClasses} boton" id="${id}>${name}</button>`;
    return (htmlToElement(newBotonString));
}

// Crear botón Valid
var validBoton = createHtmlBoton("Valid", "valid-boton", onclick="clickCheckPositions()");
// Crear botón Update Data
var updateDataBoton = createHtmlBoton("Update data", "update-boton");
// Crear botón Remove selected layer
var removeSelectedLayerBoton = createHtmlBoton("Remove selected layer", " ", "remove-selected-layer");
// Crear botón Remove all layers
var removeAllLayersBoton = createHtmlBoton("Remove all layers", " ", "remove-all-layers");
// Crear botón Create some maps
var createSomeMapsBoton = createHtmlBoton("Create some maps", " ", "create-some-maps");
// Crear botón Create all the maps
var createAllMapsBoton = createHtmlBoton("Create all the maps", " ", "create-all-maps");
// Crear botón Create combination maps
var createCombinationMapsBoton = createHtmlBoton("Create combination maps");
// Crear botón Create all individual maps
var createAllIndividualMapsBoton = createHtmlBoton("Create all individual maps");

// FUNCIÓN PARA CREAR ELEMENTO DE TIPO selector-capa
function createHtmlSelectorCapa () {
    var newSelectorCapa =   `<div class="layers" id="layer-selector">
                                <div class="layers-botones" id="layers-botones"> <!-- Filas de botones de las capas / layers -->
                                    <strong>View</strong>
                                    <div class="fila" id="fila-capa1">
                                        <button>1</button>
                                        <button onclick="clickCheckLayer('Layer1')">
                                            <i class="fa fa-eye" id="Layer1"></i>
                                        </button>
                                    </div>
                                </div> <!-- Fin de las filas de botones de las capas / layers -->

                                <div class="layers-nombre"> <!-- Nombre de las capas (7 seleccionables) -->
                                    <strong>Name</strong>
                                    <select size="7" class="select" id="layers-nombre"> 
                                        <option value="layer0" class="layers-nombreopt">vis_visible_0</option>
                                    </select>
                                </div>
                            </div> <!-- Fin de las capas (botones + nombres elegibles) -->`;
    return htmlToElement(newSelectorCapa);
}

// FUNCIÓN PARA CREAR ELEMENTO DE TIPO slider-and-input (deslizador con caja de texto input)
function createHtmlSliderAndInput (title, slider_id, id, default_value, min, max, step) {
    var newSliderAndInput = `<div class="panel">
                                <div class="centered boton form-control">
                                    <label for="${slider_id}" class="form-label">${title}</label>
                                    <input type="number" class="slider-box" id="${id}" value="${default_value}"/>
                                    <div class="slider-input">
                                        <div class="value left">${min}</div>
                                        <input type="range" min="${min}" max="${max}" value="${default_value}" step="${step}" class="boton" id="${slider-id}"/>
                                        <div class="value right">${max}</div>
                                    </div>
                                </div>
                            </div>`;
    return htmlToElement(newSliderAndInput);
}

// FUNCIÓN PARA CREAR ELEMENTO DE TIPO panel

// FUNCIÓN PARA CREAR ELEMENTO DE TIPO slider-without-input (fusionar con el andInput, sólo añade una línea)
// FUNCIÓN PARA CREAR ELEMENTO DE TIPO


////////////////////////////////////////////////////////////////////////////////////
/////////       2.FUNCIONES PARA CADA PESTAÑA (EN ORDEN)      //////////////////////
////////////////////////////////////////////////////////////////////////////////////

/************************************************ */
// COMPORTAMIENTO PESTAÑAS EN EL MENÚ DE LA DERECHA. Mostrar y ocultar. Navegabilidad
window.openTab = function(evt, tabName) {
    // Declare all variables
    var i, tabcontent, tablinks;

    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("pestana-content");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display="none";
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("pestana-link");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

     // Show the current tab, and add an "active" class to the button that opened the tab
     document.getElementById(tabName).style.display = "block";
     evt.currentTarget.className += " active";
};

/************************************************ */
// COMPORTAMIENTO DE LOS BOTONES DEL MENÚ DE LA DERECHA
// PESTAÑA POSITIONS
//Función para cambiar un check / tick del menú positions
window.clickCheckPosition = function(posNumber) {
    var iconTarget = document.getElementById(posNumber);
    // Si es tick, cambia a cruz. Si no, a la inversa
    if (iconTarget.classList.contains("fa-check")) {
        iconTarget.classList.replace("fa-check", "fa-times");
    } else {
        iconTarget.classList.replace("fa-times", "fa-check");
    }
};

//Función para cambiar los checks de todas las posiciones con botón valid. MENÚ POSITIONs
window.clickCheckPositions = function () {
    var positions = document.getElementsByClassName("positions");
    var rows = positions[0].childElementCount; // El primer y único elemento "positions"
    for (let i = 0; i < rows; i++) {
        let string = "Position" + (i+1);
        console.log(string);
        clickCheckPosition(string);
    }
};

// Función que devuelve el elemento HTML de una fila de una posición
function createHtmlFilaPosition (position) {
    // Crear botón de posición (Creando todo el html directamente con función auxiliar)
    var newRowString =  `<div class="fila">
                            <button>${position}</button>
                            <button onclick="clickCheckPosition('Position${position}')">
                                <i class="fa fa-solid fa-check" id="Position${position}"></i>
                            </button>
                        </div>`;
    return (htmlToElement(newRowString));
}


//Crear tantos botones como posiciones haya
function fillPositions () {
    // Obtener nº de posiciones a crear
    var positions = 155;

    // Tantas posiciones como haya, crear un botón
    for (var i=0; i < positions; i++) {
        // Cuál será el número del siguiente botón de posición
        var nextPosition = document.getElementById("positions").childElementCount + 1;

        // Obtener el elemento HTML de la fila con la posición indicada
        var newRowHtml = createHtmlFilaPosition(nextPosition);

        // Crear el nuevo botón añadiéndolo debajo de los anteriores
        document.getElementById("positions").appendChild(newRowHtml); 
    }
}

fillPositions();



/************************************************ */
// PESTAÑA LAYERS
//Función para extraer el número entero del nombre de una capa (auxiliar para otras funciones)
function obtainNumberLayer(string) {
    // Extraer nº capa
    var stringNumber = string.slice(5); // Formato string (5 carácteres de 'Layer')
    return Number(stringNumber);        // Formato int
}

//Función para cambiar un ojo / ojo tachado del menú layers
window.clickCheckLayer = function(layer) {
    // Cambiar icono del botón de la capa correspondiente
    var iconTarget = document.getElementById(layer);
    // Si es ojo, cambia a ojo tachado. Si no, a la inversa
    if (iconTarget.classList.contains("fa-eye"))
        iconTarget.classList.replace("fa-eye", "fa-eye-slash");
    else
        iconTarget.classList.replace("fa-eye-slash", "fa-eye");

    // Extraer nº capa
    var layerNumber = obtainNumberLayer(layer) - 1; // empezando en 1 - 1
    
    // Cambiar visibibilidad de la capa según botón visibilidad
    if (materials[layerNumber].map.source.data !== null) { // Si se ha creado restricción en addNewLayer(): materials[layerNumber] !== undefined
        materials[layerNumber].visible = (materials[layerNumber].visible == true) ? false : true;
        console.log('no está indefinido el material de esta capa. materials[layerNumber]: ', materials[layerNumber].map.source.data);
    } else {
        console.log('El material de esta capa no está definido aún');
        document.getElementById("alertMaterialUndefined").style.display = "block";
    }
};

/************************************************ */
// PESTAÑA LAYERS: Deslizador de transparencia y su cajita del número
//Slider Transparency y su cajita de información (input numérico)
var sliderTransparency = document.getElementById("slide-transparency");
var transparencyValue = document.getElementById("transparency-value");

//Al introducir un número en la caja de input, aplicar opacidad y reflejar en barra
transparencyValue.oninput = function () {
    // Mostrar valor en deslizador
    sliderTransparency.value = this.value;

    // Obtener capa seleccionada 
    var layerSelector = document.getElementById("layers-nombre");

    // Extraer nº capa
    var layerNumber = obtainNumberLayer(layerSelector.value);

    // Asociar opacidad a la capa
    materials[layerNumber].opacity = (1 - this.value); //Opacidad es lo contrario a transparencia
};
//Asociar opacidad del selector a la capa seleccionada + Mostrar valor en cajita numérica
sliderTransparency.oninput = function() {
    // Obtener capa seleccionada
    var layerSelector = document.getElementById("layers-nombre");

    // Extraer nº capa
    var layerNumber = obtainNumberLayer(layerSelector.value);

    // Asociar opacidad a la capa
    materials[layerNumber].opacity = (1 - this.value); //Opacidad es lo contrario a transparencia
    console.log(this.value);

    // Mostrar valor numérico en la cajita del input
    transparencyValue.value = this.value;
};

/************************************************ */
// PESTAÑA LAYERS: Mostrar última opacidad asignada en el marcador al seleccionar capa
var minThreshold = document.getElementById("slide-min-threshold");
var maxThreshold = document.getElementById("slide-max-threshold");
document.getElementById("layers-nombre").onchange = function () {
    // Extraer nº capa
    var layerNumber = obtainNumberLayer(this.value); // comenzando en 0

    // Asociar opacidad de la capa al valor del deslizador
    sliderTransparency.value = (1 - materials[layerNumber].opacity);
    console.log('layerNumber al seleccionar es:', layerNumber);

    // Mostrar valor numérico en la cajita del input
    transparencyValue.value = sliderTransparency.value;

    // Si es la 1ª capa (la nº 0), oculta los parámetros del panel Color mixing y menú izquierda
    var panelColorMixing = document.getElementById("color-mixing");
    var menuIzq = document.getElementById("menu-izquierda");
    if (layerNumber == 0) {
        panelColorMixing.style.display = "none";
        menuIzq.style.display = "none";
    } else {
        panelColorMixing.style.display = "block";
        menuIzq.style.display = "block";

        // Mostrar el título del elemento encima de la barra de color del menú de la izquierda (títlo h2)
        menuIzq.children[0].innerHTML = arrayLayers[layerNumber].element;
        console.log('elemento de la capa seleccionada: ', arrayLayers[layerNumber].element); //Modificar cuando se elimine capa a layerNumber + 1

        // Redibujar barra de color de esta capa con este elemento
        colorBar(arrayLayers[layerNumber].element, layerNumber);        
    }
};

/************************************************ */
// PESTAÑA LAYERS: Subpanel de Difference of Gaussians
//Concordancia entre el input de un número con su valor en la barra de deslizamiento
//Gaussian Threshold
var gaussianThresholdValue = document.getElementById("gaussian-threshold-value");
var sliderGaussianThreshold = document.getElementById("gaussian-threshold");
sliderGaussianThreshold.value = 250;
gaussianThresholdValue.oninput = function () {
   sliderGaussianThreshold.value = this.value;
};

sliderGaussianThreshold.oninput = function () {
    gaussianThresholdValue.value = this.value;
};

//Big gaussian size
var bigGaussianValue = document.getElementById("big-gaussian-value");
var sliderBigGaussian = document.getElementById("big-gaussian-size");
sliderBigGaussian.value = 25;
bigGaussianValue.oninput = function () {
    sliderBigGaussian.value = this.value;
}; 

sliderBigGaussian.oninput = function () {
    bigGaussianValue.value = this.value;
};

//Small gaussian size
var smallGaussianValue = document.getElementById("small-gaussian-value");
var sliderSmallGaussian = document.getElementById("small-gaussian-size");
sliderSmallGaussian.value = 13;
smallGaussianValue.oninput = function () {
    sliderSmallGaussian.value = this.value;
}; 

sliderSmallGaussian.oninput = function () {
    smallGaussianValue.value = this.value;
};

/************************************************ */
// PESTAÑA LAYERS: Botón de Remove Selected Layer
// Función auxiliar que elimina la capa del índice indicado
function removeLayer (index) {
    // Eliminar el nombre de la capa seleccionada
    var selectLayers = document.getElementById("layers-nombre");
    selectLayers.remove(index);

    // Disminuir en 1 el tamaño del select layers-nombre que lo contiene (evitar hueco en blanco)
    if (selectLayers.options.length > 1) {
        selectLayers.setAttribute("size", (selectLayers.options.length));
    } else {
        selectLayers.setAttribute("size", 2); // 1 capa del fondo + 1 hueco libre como mínimo
    }
    console.log("selectLayers (nombres) tras borrar nombre + ajuste size: ", selectLayers); 
    
    // Eliminar los botones asociados a la capa eliminada
    var botonesCapa = document.getElementById("layers-botones").children.item(`${index + 1}`); // Los botones no se reindexan
    console.log("botonesCapa con ese fila-capa: ", botonesCapa);
    botonesCapa.remove();
}

document.getElementById("remove-selected-layer").onclick = function () {
    // Eliminar el nombre de la capa seleccionada
    var selectLayers = document.getElementById("layers-nombre");
    var removedIndex = selectLayers.selectedIndex; //selectedIndex es dinámico, se reindexa al borrar una opción
    console.log("selectedIndex del selectLayers (nombre): ", removedIndex);
    removeLayer(removedIndex);
};

/************************************************ */
// PESTAÑA LAYERS: Botón de Remove All Layers
document.getElementById("remove-all-layers").onclick = function () {
    // Eliminar los nombres de las capas que no sean el fondo (capa 0)
    let selectLayers = document.getElementById("layers-nombre");
    console.log('length de selectLayers', selectLayers.options.length);

    // Recorrer todas las opciones en sentido inverso (índice se actualiza al borrar)
    for (var i = (selectLayers.options.length - 1); i > 0; i--) {
        removeLayer(i);
        console.log("item borrado: ", i);
    }
};

/************************************************ */
// PESTAÑA XRF: Botón Create Some Maps
function addNewLayer (element) {
    //If está todo el formulario de la pestaña XRF relleno y señalado:
    //else
    //console.warning("Es obligatorio rellenar todas las opciones del formulario");

    // Crear el nombre de la capa nueva con una nueva opción de selección
    var newLayer = document.createElement("option");

    // Obtener el número y el nombre de la capa a crear
    var lastValue = document.querySelector("#layers-nombre > .layers-nombreopt:last-child").value;
    console.log("Valor de query es: ", lastValue); // Comenzando en 0
    var lastValueNumber = obtainNumberLayer(lastValue);
    console.log('lastValueNumber es: ', lastValueNumber);
    var newLayerValue = 'layer' + (lastValueNumber + 1);
    console.log('newLayerValue es: ', newLayerValue);

    // Asignar atributos a la capa nueva a crear
    newLayer.setAttribute("class", "layers-nombreopt");
    newLayer.setAttribute("value", newLayerValue);
    var newText = document.createTextNode("vis_visible_" + (lastValueNumber + 1) + "_" + element);
    newLayer.appendChild(newText);

    // Aumentar el tamaño del select layers-nombre que lo contiene (evitar scroll) respecto al último tamaño
    var lastLength = document.getElementById("layers-nombre").options.length;
    document.getElementById("layers-nombre").setAttribute("size", (lastLength + 1));

    // Crear la capa en el documento HTML
    document.getElementById("layers-nombre").appendChild(newLayer);

    // Crear botones acompañantes a la capa (1ª TÉCNICA: clonando el primer botón)
    /*
    var newRow = document.getElementById("fila-capa1").cloneNode(true);

    // Modificamos los atributos para que encajen con los de la nueva capa
    newRow.setAttribute("id", ("fila-capa" + (lastValueNumber + 1)));
    newRow.firstChild.nextSibling.textContent = (lastValueNumber + 1) ;
    console.log(newRow.firstChild.nextSibling.textContent);

    var eyeButton = document.querySelector("#layers-botones > .fila button:nth-child(2)"); // Selecciona todos los eyeButtons
    eyeButton.setAttribute("onclick", "clickCheckLayer('Layer" + (lastValueNumber + 1) + "')");

    var eyeButtonIcon = document.querySelector("#layers-botones > .fila i"); // Selecciona todos los eyeButtonIcons (el primero que coincida)
    eyeButtonIcon.setAttribute("id", "Layer" + (lastValueNumber + 1));

    // Crear los botones añadiéndolos debajo de los anteriores
    document.getElementById("layers-botones").appendChild(newRow);
    */

    // Crear botones acompañantes a la capa (2ª TÉCNICA: Creando todo el html directamente con función auxiliar)
    var newRowString =    `<div class="fila" id="fila-capa${lastValueNumber + 2}">
                                <button>${lastValueNumber + 2}</button>
                                <button onclick="clickCheckLayer('Layer${lastValueNumber + 2}')">
                                    <i class="fa fa-eye-slash" id="Layer${lastValueNumber + 2}"></i>
                                </button>
                            </div>`;
    var newRowHtml = htmlToElement(newRowString); // ids comenzando en 1

    // Crear botones añadiéndolos debajo de los anteriores
    document.getElementById("layers-botones").appendChild(newRowHtml);  
    

    // Asociar elemento al array de capas (clase implementada)
    var layerAux = new AuxiliaryLayer("vis_visible", element, AuxiliaryLayer.InterpolationType.MinCartesianDistance, false, AuxiliaryLayer.PosNormalization.Homogeneous, AuxiliaryLayer.Probe[1], AuxiliaryLayer.Palette.Discrete_color_2_interval);
    arrayLayers.push(layerAux);
    console.log('arrayLayers tras añadir: ', arrayLayers);

    // Crear y añadir la textura al array de capas de Three.js
    var burbuja = new THREE.TextureLoader().load(`static/images/burbuja${lastValueNumber + 1}.png`);
    burbuja.format = THREE.RGBAFormat;
    burbuja.colorSpace = THREE.SRGBColorSpace;
    var materialburbuja = new THREE.MeshBasicMaterial( { 
        map: burbuja,
        depthTest: false,
        transparent: true,
        visible: false
    });

    plano.addGroup( 0, Infinity, materials.length ); // Debería ser lastValueNumber
    materials.push(materialburbuja);
    console.log('array materials tras añadir: ', materials);
    console.log('nº de la nueva capa en el array de materiales: ', materials.length);

    mesh3 = new THREE.Mesh( plano, materials ); //se van creando objetos que sobrecargan el programa. Destruirlos
    scene.add( mesh3 );
}

// Comportamiento al clicar el botón 'Create Some Maps' de XRF
document.getElementById("create-some-maps").onclick = function () {
    // Obtener todos los elementos seleccionados (uno o múltiples elementos seleccionados)
    var collection = document.getElementById("select-elements").selectedOptions;

    // Crear una nueva capa por cada elemento seleccionado
    for (var i = 0; i < collection.length; i++) {
        console.log("Añadiendo la capa del elemento: ", collection[i].value);
        addNewLayer(collection[i].value);
    }
};

// Comportamiento al clicar el botón 'Create all maps' de XRF
document.getElementById("create-all-maps").onclick = function () {
    console.log(document.getElementById("select-elements").options.length, "elementos nuevos"); // 18 elementos
    // Crear una nueva capa por cada elemento que haya en el selector de elementos
    for (var i = 0; i < document.getElementById("select-elements").options.length; i++) {
        addNewLayer(document.getElementById("select-elements").options[i].value);
    }
};


////////////////////////////////////////////////////////////////////////////////////
/////////      3.FUNCIONES PARA CANVAS PRINCIPAL (THREE.JS)      ///////////////////
////////////////////////////////////////////////////////////////////////////////////

/************************************************ */
// FUNCIONALIDADES PARA EL CANVAS
var canvReference = document.getElementById("canvas1");	// Seleccionar el canvas

/************************************************ */
// IMPORTACIÓN DE COMPONENTES DE THREE.JS
import * as THREE from 'three';
// Add-on para zoom y arrastre
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

/************************************************ */
// CONSTRUCCIÓN DEL ENTORNO DE THREE.JS
// Creación de la escena
const scene = new THREE.Scene();
scene.background = new THREE.Color('grey');

// Creación de la cámara
const camera = new THREE.PerspectiveCamera( 125, window.innerWidth / window.innerHeight, 1, 1000 );
camera.position.z = 5;

// Creación del renderizador
const renderer = new THREE.WebGLRenderer({ 
	antialias: true, 
	canvas: canvReference 
});
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight, false); // Se previene cualquier cambio al aspecto del canvas

// Configuración para la textura del fondo
const textura = new THREE.TextureLoader().load('static/images/transfiguracion.png');
textura.colorSpace = THREE.SRGBColorSpace;
textura.format = THREE.RGBAFormat;
const material = new THREE.MeshBasicMaterial( { 
    map: textura,
    transparent: true
});

// Plano sobre el que proyectar la textura
const plano = new THREE.PlaneGeometry(104.2, 108.74);
//var lienzo = new THREE.Mesh(plano, material);
//lienzo.position.set(0,0,0);

// Construcción de la escena
//scene.add(lienzo);

///////////////////////////////////////////////////////////////////////
///MULTICAPA: VERSIÓN SIMPLEMENTE AÑADIENDO OBJETOS A LA ESCENA
//renderer.sortObjects = true;
// Crear textura y material con Darth Vader 1
var darthvader = new THREE.TextureLoader().load('static/images/darth-vader.png');
darthvader.format = THREE.RGBAFormat;
darthvader.colorSpace = THREE.SRGBColorSpace;
var materialvader = new THREE.MeshBasicMaterial( { 
    map: darthvader,
    depthTest: false,
    transparent: true,
    visible: false
});
//var mesh = new THREE.Mesh(plano, materialvader);
//scene.add(mesh);

// Crear textura y material con Darth Vader 2
var darthvader2 = new THREE.TextureLoader().load('static/images/darth-vader2.png');
var materialvader2 = new THREE.MeshBasicMaterial( {
    map: darthvader2,
    depthTest: false,
    transparent: true,
    visible: false
});
//var mesh2 = new THREE.Mesh(plano, materialvader2);
//scene.add(mesh2);
///////////////////////////////////////////////////////////////////////
///VERSIÓN ALTERNATIVA MULTICAPAS CON TEXTURAS DISTINTAS Y TRANSPARENCIA SOBRE EL MISMO PLANO
plano.clearGroups();
plano.addGroup( 0, Infinity, 0 );
plano.addGroup( 0, Infinity, 1 );
plano.addGroup( 0, Infinity, 2 );

var materials = [ material, materialvader, materialvader2 ];

// mesh
var mesh3 = new THREE.Mesh( plano, materials );
scene.add( mesh3 );

// Crear array de objetos con clase personalizada para las capas
var layer0 = new AuxiliaryLayer("vis_visible", "Ca", AuxiliaryLayer.InterpolationType.MinCartesianDistance, false, AuxiliaryLayer.PosNormalization.Homogeneous, AuxiliaryLayer.Probe[1], AuxiliaryLayer.Palette.Discrete_color_2_interval);
var layer1 = new AuxiliaryLayer("vis_visible", "Ti", AuxiliaryLayer.InterpolationType.MinCartesianDistance, false, AuxiliaryLayer.PosNormalization.Homogeneous, AuxiliaryLayer.Probe[1], AuxiliaryLayer.Palette.Discrete_color_2_interval);
var layer2 = new AuxiliaryLayer("vis_visible", "Hg", AuxiliaryLayer.InterpolationType.MinCartesianDistance, false, AuxiliaryLayer.PosNormalization.Homogeneous, AuxiliaryLayer.Probe[1], AuxiliaryLayer.Palette.Discrete_color_2_interval);
var arrayLayers = [layer0, layer1, layer2];
///////////////////////////////////////////////////////////////////////
/************************************************ */
// CONTROLES DE ZOOM Y ARRASTRE
const controles = new OrbitControls( camera, renderer.domElement );
controles.enableRotate = false; 	// Desactivar rotación vertical y horizontal
controles.enableZoom = true; 		// Activar zoom
controles.maxDistance = 50.0; 		// Límite distancia zoom out
controles.minDistance = 1.0;		// Límite distancia zoom in
controles.mouseButtons = {			// Acciones botones del ratón
	LEFT: THREE.MOUSE.PAN,
	MIDDLE: THREE.MOUSE.DOLLY,
	RIGHT: THREE.MOUSE.PAN
}

/************************************************ */
// BUCLE DE LA ANIMACIÓN
function animate() {
	requestAnimationFrame( animate );
	renderer.render( scene, camera );
}

animate();

/************************************************ */
// MANTENER PROPORCIONES LIENZO AL REDIMENSIONAR VENTANA
// Almacenar valores
var tanFOV = Math.tan( ( ( Math.PI / 180 ) * camera.fov / 2 ) );
var windowHeight = window.innerHeight;

// Event Listeners
// -----------------------------------------------------------------------------
window.addEventListener( 'resize', onWindowResize, false );

function onWindowResize( event ) {
    camera.aspect = window.innerWidth / window.innerHeight;
    
    // adjust the FOV
    camera.fov = ( 360 / Math.PI ) * Math.atan( tanFOV * ( window.innerHeight / windowHeight ) );
    
    camera.updateProjectionMatrix();
    camera.lookAt( scene.position );

    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.render( scene, camera );   
}


////////////////////////////////////////////////////////////////////////////////////
/////////      4.FUNCIONES DEL MENÚ DE LA IZQUIERDA (BARRA DE COLOR)    ////////////
////////////////////////////////////////////////////////////////////////////////////

/************************************************ */
// MENÚ IZQUIERDA
// ESCOGER COLOR EN PALETA PERSONALIZADA DE DEGRADADOS (CANVAS DE LA VENTANA MODAL)
// Variable global inicializada para poder reutilizarla en otras funciones
var globalRgba = undefined;

function initColorPicker() {
    var colorCanvas = document.getElementById('colorCanvas');
    var canvasContext = colorCanvas.getContext('2d');
  
    let gradient = colorCanvas.getContext('2d').createLinearGradient(0, 0, colorCanvas.width, 0);
    // Especificar colores entre los que se hará la transición
    gradient.addColorStop(0, "red");
    gradient.addColorStop(1 / 6, "yellow");
    gradient.addColorStop((1 / 6) * 2, "lawngreen");
    gradient.addColorStop((1 / 6) * 3, "cyan");
    gradient.addColorStop((1 / 6) * 4, "blue");
    gradient.addColorStop((1 / 6) * 5, "magenta");
    gradient.addColorStop(1, "red");
    colorCanvas.getContext('2d').fillStyle = gradient;
    colorCanvas.getContext('2d').fillRect(0, 0, colorCanvas.width, colorCanvas.height);
    
    // Añadir gradiente de colores hacia el blanco
    gradient = colorCanvas.getContext('2d').createLinearGradient(0, 0, 0, colorCanvas.height);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    colorCanvas.getContext('2d').fillStyle = gradient;
    colorCanvas.getContext('2d').fillRect(0, 0, colorCanvas.width, colorCanvas.height);
  
    // Añadir gradiente de colores hacia el negro
    gradient = colorCanvas.getContext('2d').createLinearGradient(0, 0, 0, colorCanvas.height);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 1)');
    colorCanvas.getContext('2d').fillStyle = gradient;
    colorCanvas.getContext('2d').fillRect(0, 0, colorCanvas.width, colorCanvas.height);
    
    var showColor = document.getElementById('showColor');
    var showCntxt = showColor.getContext('2d');
    // Activar acción al clicar sobre la paleta
    colorCanvas.onclick = function(e) {
        var imgData = canvasContext.getImageData((e.offsetX / colorCanvas.clientWidth) * colorCanvas.width, (e.offsetY / colorCanvas.clientHeight) * colorCanvas.height, 1, 1);
        globalRgba = imgData.data;
        var color = "rgba(" + globalRgba[0] + ", " + globalRgba[1] + ", " + globalRgba[2] + ", " + globalRgba[3] + ")";
        console.log("%c" + color, "color:" + color);

        // Mostrar color seleccionado en canvas pequeño
        showCntxt.fillStyle = color;
        showCntxt.fillRect(0, 0, showColor.width, showColor.height);
    };
  }
  
  initColorPicker();

/************************************************ */
// MENÚ IZQUIERDA
// Barra de color con degradado del menú de la izquierda
function colorBar (element="Ca", layerNumber=0) {
    var colorBar = document.getElementById('barra-color');
    var canvasBarContext = colorBar.getContext('2d');

    // Limpiar canvas anterior si hubo alguno (para borrar rectángulos creados anteriores)
    canvasBarContext.clearRect(0, 0, colorBar.width, colorBar.height);

    // Crear gradiente de color
    let gradient = canvasBarContext.createLinearGradient(0, 0, colorBar.width, colorBar.height);

    // Especificar color de la transición (gradiente)
    if (globalRgba == undefined) { // si aún no se ha seleccionado un color en ninguna capa con la ventana modal
        console.log('Hey! estoy entrando en el primer if', element);
        console.log(ElementColor[element]); // (color predeterminado de la capa seleccionada)
        var barColorArray = ElementColor[element];
        var barColor = `rgba(${ElementColor[element][0]}, ${ElementColor[element][1]}, ${ElementColor[element][2]}, ${ElementColor[element][3]})`; // Variable color de la barra (no confundir con variable Barra de color: colorBar)
    } else {
        arrayLayers[layerNumber].color = globalRgba;
        barColorArray = globalRgba;
        barColor = `rgba(${arrayLayers[layerNumber].color[0]}, ${arrayLayers[layerNumber].color[1]}, ${arrayLayers[layerNumber].color[2]}, ${arrayLayers[layerNumber].color[3]})`;
        console.log("%c" + barColor, "barColor: " + barColor);
    } 

    // Asignar colores al gradiente (color y posición)
    gradient.addColorStop(0, barColor);   
    gradient.addColorStop(1, "white");

    // Función para dibujar un borde a un rectángulo creado con JS en un canvas
    function drawBorder(xPos, yPos, width, height, thickness = 1) {
        canvasBarContext.fillStyle='#000';
        // Se supone que las posiciones no son el límite del canvas para que se pueda visualizar el borde
        canvasBarContext.fillRect(xPos - (thickness), yPos - (thickness), width + (thickness * 2), height + (thickness * 2));
    }
    var thickness = 0.8; // Grosor de borde
    drawBorder(colorBar.width*0.4, 0, colorBar.width*0.2, colorBar.height, thickness); // Borde de la barra de color gradiente

    // Rellenar el canvas (Barra de color) con este gradiente
    canvasBarContext.fillStyle = gradient;
    canvasBarContext.fillRect(colorBar.width*0.4, (0+thickness), colorBar.width*0.2, (colorBar.height-2*thickness));

    /********************** */
    // Crear rectángulos pequeños de información
    var squareSize = 20; // Tamaño de todos los rectángulos
    // Primer rectángulo (el superior)
    drawBorder(0, 0, squareSize, squareSize, thickness); // Borde del rectángulo superior
    canvasBarContext.fillStyle = barColor;
    canvasBarContext.fillRect(thickness, thickness, squareSize-thickness, squareSize - thickness);

    // Rectángulo intermedio (el del medio)
    drawBorder(0, (colorBar.height - squareSize)/2, squareSize, squareSize, thickness); // Borde del rectángulo intermedio
    var intermediateColor = `rgba(${(barColorArray[0]+255)/2}, ${(barColorArray[1]+255)/2}, ${(barColorArray[2]+255)/2}, ${barColorArray[3]})`;
    canvasBarContext.fillStyle = intermediateColor;
    canvasBarContext.fillRect(thickness, (colorBar.height - squareSize)/2, squareSize-thickness, squareSize);

    // Último rectángulo (el inferior)
    drawBorder(0, colorBar.height - squareSize, squareSize, squareSize, thickness); // Borde del rectángulo inferior
    canvasBarContext.fillStyle = "white";
    canvasBarContext.fillRect(thickness, (colorBar.height - squareSize), squareSize-thickness, squareSize - thickness);
    

    /********************** */
    // Función para dibujar las líneas auxiliares que conectan la barra de color con los rectángulos pequeños
    function drawColorBarLine (originX, originY, destinyX, destinyY) {
        canvasBarContext.beginPath();                   // Comienzo de un nuevo trazo
        canvasBarContext.moveTo(originX, originY);      // Punto de comienzo de la línea
        canvasBarContext.lineTo(destinyX, destinyY);    // Dibujar línea hasta el punto ()
        canvasBarContext.lineWidth = thickness;         // Grosor de la línea
        canvasBarContext.stroke();                      // Renderiza el trazo
    }

    // Línea del rectángulo superior
    drawColorBarLine(squareSize, 0, colorBar.width*0.4, 0);

    // Línea del rectángulo intermedio
    drawColorBarLine(squareSize, (colorBar.height - squareSize)/2 + squareSize/2,  colorBar.width*0.4, (colorBar.height - squareSize)/2  + squareSize/2);

    // Línea del rectángulo inferior
    drawColorBarLine(squareSize, colorBar.height,  colorBar.width*0.4, colorBar.height);

    // Función para dibujar textos (valores en números) en negro junto a cada rectángulo
    function drawText (text, originX, originY) {
        canvasBarContext.font = "10px serif";    // Fuente del texto de todos los rectángulos
        canvasBarContext.fillStyle = "#000"; // Letra negra
        canvasBarContext.fillText(text, originX, originY);
    }

    // Dibujar textos de la barra de color
    drawText("10552", colorBar.width*0.65, squareSize/2); // Texto de rectángulo superior
    drawText(`${10552/2}`, colorBar.width*0.65, (colorBar.height + squareSize/2)/2); // Texto de rectángulo intermedio
    drawText("0", colorBar.width*0.65, colorBar.height); // Texto de rectángulo inferior

    // Si se clica sobre la barra, se crea rectángulo con línea a esa altura de la barra
    colorBar.onclick = function (e) {
        var mouseX = e.pageX - this.offsetLeft;

        // Si el clic se encuentra sobre la barra del gradiente (teniendo en cuenta sólo el valor horizontal del clic por ocupar toda la altura)
        if (mouseX >= (colorBar.width*0.4 + thickness) && 
            mouseX <= (colorBar.width*0.6 - thickness)) {
                // Se extrae el color exacto del gradiente sobre el que se ha clicado
                var imgData = canvasBarContext.getImageData((e.offsetX / colorBar.clientWidth) * colorBar.width, (e.offsetY / colorBar.clientHeight) * colorBar.height, 1, 1);
                var selectedGradientColor = imgData.data;
                var selectedColor = "rgba(" + selectedGradientColor[0] + ", " + selectedGradientColor[1] + ", " + selectedGradientColor[2] + ", " + selectedGradientColor[3] + ")";
                console.log("%c" + selectedColor, "color:" + selectedColor);

                // Crear rectángulo con su borde con el color de la altura seleccionada del gradiente
                drawBorder(0, (e.offsetY / colorBar.clientHeight) * colorBar.height - squareSize/2, squareSize, squareSize, thickness); // Borde del rectángulo
                canvasBarContext.fillStyle = selectedColor;
                canvasBarContext.fillRect(thickness, (e.offsetY / colorBar.clientHeight) * colorBar.height - squareSize/2, squareSize-thickness, squareSize); // Rellenar borde con rectángulo de color
                // Línea auxiliar del rectángulo
                drawColorBarLine(squareSize, (e.offsetY / colorBar.clientHeight) * colorBar.height,  colorBar.width*0.4, (e.offsetY / colorBar.clientHeight) * colorBar.height);
                // Dibujar texto con valor correspondiente a la normalización del punto clicado
                drawText(`${((colorBar.clientHeight - e.offsetY) / colorBar.clientHeight) * 10552}`, colorBar.width*0.65, (e.offsetY / colorBar.clientHeight) * colorBar.height); // offsetY debe ser considerado a la inversa - su (0,0) está arriba
        }       
    };
}

// Atribuir un color a la barra nada más cargar la página
colorBar("Ca", 0);

// Si se selecciona otro color en la ventana modal, se actualiza en la barra
document.getElementById("ok-color").onclick = colorBar;