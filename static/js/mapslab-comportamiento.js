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


/****************************************** */
// CLASE PARA MANEJAR JSON CON MÉTODOS

// Se cargará el JSON 1 sóla vez y se almacena en esta variable
var botonesPromise = loadJSON("/static/json/botones.json");
var botonesJson = await botonesPromise;

// Auxiliary function to get the id of the current project from the url // Función auxiliar para extraer id del proyecto actual de la url
function getProjectId() {
    let currentUrl = window.location.href;
    // Return the id number from current url ./app/<id>
    return currentUrl.split('/')[4];
}

// Clase con todos los métodos de modificación y actualización del JSON en el servidor, y actualización del HTML en el front
class jsonStatus {
    // Constructor de la clase jsonStatus
    // constructor() {
    //      = ;
    // }

    // Métodos static (común para todas las instancias) 
    // Cambiar JSON de un botón
    static async Button_onclick (tabNumber, buttonOrderNumber, buttonid) {
        // Cargar JSON
        // var botonesPromise = loadJSON("static/json/botones.json");
        // var botones = await botonesPromise;
        // console.log('Estos botones: ', botonesJson);

        // Modificar el JSON cargado al principio de la app que generaba los botones en html
        // Si el estado del botón era "no clicado", se marca como clicado. Si no, como no clicado
        if (botonesJson[tabNumber].Container[buttonOrderNumber].status == "not clicked") {
            botonesJson[tabNumber].Container[buttonOrderNumber].status = "clicked";
        } else {
            botonesJson[tabNumber].Container[buttonOrderNumber].status = "not clicked";
        }

        // Actualizar el elemento HTML botón que ha cambiado (volver a generarlo con el cambio aplicado)
        if (buttonid == "create-all-maps") {
            // Crear una nueva capa por cada elemento que haya en el selector de elementos
            for (var i = 0; i < document.getElementById("select-elements").options.length; i++) {
                addNewLayerButtons(document.getElementById("select-elements").options[i].value);
            }
        }

        // Enviar al servidor nuevo JSON modificado - parcialmente en el json de cambios
        let modificacion = await myButtonEvt("/receive", botonesJson[tabNumber].Container[buttonOrderNumber]);
        console.log('El front le he enviado al server la modificación: ', modificacion);
    }

    static async Checkbox_onchange(tabNumber, elementOrderNumber, panelOrderNumber) {
        // Modificar el JSON cargado al principio de la app que generaba los botones HTML
        // Si el checkbox está dentro de un panel, tener en cuenta su posición dentro del panel que lo contiene
        var elementoJson = panelOrderNumber == undefined ? botonesJson[tabNumber].Container[elementOrderNumber] : botonesJson[tabNumber].Container[elementOrderNumber].components[panelOrderNumber];
        if (elementoJson.status == "checked") {
            elementoJson.status = "unchecked";
        } else {
            elementoJson.status = "checked";
        }

        // Actualizar elemento HTML
        if (elementoJson.status == "checked") { // Si ahora el elemento se ha quedado checked
            this.checked = true;
        } else {
            this.checked = false;
        }
        console.log(botonesJson[tabNumber].Container[elementOrderNumber]);
        // Enviar al servidor nuevo JSON modificado
        let modificacion = await myButtonEvt("/receive", elementoJson);
        console.log('El front le he enviado al server la modificación: ', modificacion);
    }

    static async FilaPosition_onclick(tabNumber, buttonOrderNumber, buttonIdNumber, buttonid) {
        console.log("Detecto que el botón.status es éste:", botonesJson[tabNumber].Container[buttonOrderNumber].components[buttonIdNumber].status);
        // Modificar el JSON cargado al principio de la app que generaba los botones HTML
        // Si el estado del botón era "no clicado", se marca como clicado. Si no, como no clicado
        if (botonesJson[tabNumber].Container[buttonOrderNumber].components[buttonIdNumber].status == "not clicked") {
            botonesJson[tabNumber].Container[buttonOrderNumber].components[buttonIdNumber].status = "clicked"
        } else {
            botonesJson[tabNumber].Container[buttonOrderNumber].components[buttonIdNumber].status = "not clicked";
        }

        // Actualizar HTML con la funcionalidad que supondría clicar este botón
        // Cambiar el icono del botón clicado. De Check -> Cruz -> Check
        var posNumber = buttonid.slice(6);  // Obtener Position6 de 'ButtonPosition6'
        clickCheckPosition(posNumber);      // Esta función requiere pasarle formato 'Position4'

        // Enviar al servidor nuevo JSON modificado
        let modificacion = await myButtonEvt("/receive", botonesJson[tabNumber].Container[buttonOrderNumber].components[buttonIdNumber]);
        console.log('El front le he enviado al server la modificación: ', modificacion);
    }

    static async FilaSelectorCapa_onclick(tabNumber, buttonOrderNumber, buttonIdNumber, buttonid) {
        // Modificar el JSON cargado al principio de la app que generaba los botones HTML
        // Si el estado del botón era "no clicado", se marca como clicado. Si no, como no clicado
        if (botonesJson[tabNumber].Container[buttonOrderNumber].components[buttonIdNumber].status == "invisible") {
            botonesJson[tabNumber].Container[buttonOrderNumber].components[buttonIdNumber].status = "visible"
        } else {
            botonesJson[tabNumber].Container[buttonOrderNumber].components[buttonIdNumber].status = "invisible";
        }

        // Actualizar HTML con la funcionalidad que supondría clicar este botón
        var layNumber;
        if (buttonid.startsWith('ButtonLayer')) {
            layNumber = buttonid.slice(6);  // Obtener Layer6 de 'ButtonLayer6'
        } else {
            layNumber = buttonid;
        }
        clickCheckLayer(layNumber);         // Esta función requiere pasarle formato 'Layer4'

        // Enviar al servidor nuevo JSON modificado
        let modificacion = await myButtonEvt("/receive", botonesJson[tabNumber].Container[buttonOrderNumber].components[buttonIdNumber]);
        console.log('El front le he enviado al server la modificación por presionar botón de filacapa: ', modificacion);
    }

    static async SelectMultiple_onchange(tabNumber, elementOrderNumber, selectedOptions, selectObject) {
        // Modificar el JSON cargado al principio de la app que generaba los botones HTML
        for (var i = 0; i < selectedOptions.length; i++) { // Recorrer el array de JSONs con status de los botones
            if (selectedOptions[i].status == "clicked") {
                botonesJson[tabNumber].Container[elementOrderNumber].values[i].status = "clicked";
            } else {
                botonesJson[tabNumber].Container[elementOrderNumber].values[i].status = "not clicked";
            }

            // Enviar modificación JSON al servidor. POR CADA OPCIÓN DEL SELECT, UNA PETICIÓN
            // let modificacion = await myButtonEvt("/receive", botonesJson[tabNumber].Container[elementOrderNumber].values[i]);
            // console.log('El front le he enviado al server la modificación: ', modificacion);
        }

        // Enviar modificación JSON al servidor del COMPONENTE SELECT COMPLETO
        let modificacion = await myButtonEvt("/receive", botonesJson[tabNumber].Container[elementOrderNumber]);
        console.log('El front le he enviado al server la modificación: ', modificacion);

        // Actualizar elemento HTML
        // Realmente clicar una opción aún no tiene un efecto inmediato
        // El siguiente for provisional se podría combinar con el anterior
        for (var i = 0; i < selectObject.options.length; i++) {
            if (selectedOptions[i].status == "clicked") {
                selectObject.options[i].selected = "selected";
            }
        }
    }

    static async Select_onchange (tabNumber, elementOrderNumber, selectedOption, selectObject, panelOrderNumber) {
        // Modificar el JSON cargado al principio de la app que generaba los botones HTML
        // Si el select está dentro de un panel, tener en cuenta su posición dentro del panel que lo contiene
        var elementoJson = panelOrderNumber == undefined ? botonesJson[tabNumber].Container[elementOrderNumber] : botonesJson[tabNumber].Container[elementOrderNumber].components[panelOrderNumber];
        
        for (var i = 0; i < selectObject.options.length; i++) {
            // Todas las opciones del select se marcan como NO clicadas
            elementoJson.values[i].status = "not clicked";
        }
        // Sólo la opción seleccionada se marca a clicado
        elementoJson.values[selectedOption].status = "clicked";
        

        // Actualizar elemento HTML
        selectObject.options[selectedOption].selected = "selected";

        // Enviar modificación JSON al servidor del COMPONENTE SELECT COMPLETO
        let modificacion = await myButtonEvt("/receive", elementoJson);
        console.log('El front le he enviado al server la modificación: ', modificacion);
    }

    static async SliderAndInput_onchange(tabNumber, elementOrderNumber, slider_value, panelOrderNumber) {
        // Modificar el JSON cargado al principio de la app que generaba los botones HTML
        // Si el slider está dentro de un panel, tener en cuenta su posición dentro del panel que lo contiene
        var elementoJson = panelOrderNumber == undefined ? botonesJson[tabNumber].Container[elementOrderNumber] : botonesJson[tabNumber].Container[elementOrderNumber].components[panelOrderNumber];
        elementoJson.slidervalue = slider_value;
        // Su caja de texto muestra el nuevo valor del slider
        elementoJson.inputvalue = slider_value;

        // Actualizar elemento HTML
        // ...Restaurar valores en slider + input...

        // Enviar al servidor nuevo JSON modificado
        let modificacion = await myButtonEvt("/receive", elementoJson);
        console.log('El front le he enviado al server la modificación: ', modificacion);
    }

    static async SliderWithoutInput_onchange(tabNumber, elementOrderNumber, panelOrderNumber, slider_value) {
        // Modificar el JSON cargado al principio de la app que generaba los botones HTML
        // Si el slider está dentro de un panel, tener en cuenta su posición dentro del panel que lo contiene
        var elementoJson = panelOrderNumber == undefined ? botonesJson[tabNumber].Container[elementOrderNumber] : botonesJson[tabNumber].Container[elementOrderNumber].components[panelOrderNumber];
        elementoJson.slidervalue = slider_value; // Actualizar valor del slider en el JSON
    
        // Actualizar elemento HTML
        // ...Restaurar valores en slider...

        // Enviar al servidor nuevo JSON modificado
        let modificacion = await myButtonEvt("/receive", elementoJson);
        console.log('El front le he enviado al server la modificación: ', modificacion);
    }

    static async TextInput_oninput(tabNumber, elementOrderNumber, panelOrderNumber, inputObject) {
        // Modificar el JSON cargado al principio de la app que generaba los botones HTML
        // Si el checkbox está dentro de un panel, tener en cuenta su posición dentro del panel que lo contiene
        var elementoJson = panelOrderNumber == undefined ? botonesJson[tabNumber].Container[elementOrderNumber] : botonesJson[tabNumber].Container[elementOrderNumber].components[panelOrderNumber];
        
        elementoJson.inputvalue = replaceSpaces(inputObject.value);
        // elementoJson.slidervalue = replaceSpaces(inputObject.value); // En text input no hay slider

        // Actualizar elemento HTML
        // inputObject.value = elementoJson.inputvalue;
        // Si estaba conectado a un slider de tipo slider-and-input, cambiar valor de su slider también

        // Enviar al servidor nuevo JSON modificado
        let modificacion = await myButtonEvt("/receive", elementoJson);
        console.log('El front le he enviado al server la modificación: ', modificacion);
    }
}


////////////////////////////////////////////////////////////////////////////////////
//////  2.FUNCIONES PARA CREAR TODOS LOS TIPOS DE BOTONES DE LA APLICACIÓN  /////////
////////////////////////////////////////////////////////////////////////////////////

/************************************************ */
// Función auxiliar para transformar string en HTML
function htmlToElement(html) {
    let template = document.createElement('template');
    template.innerHTML = html.trim();
    return template.content.firstChild;
}

// Función asíncrona para cargar el archivo JSON desde una localización
async function loadJSON (url) {
    const res = await fetch(url);
    return await res.json();
}
// Se cargará el JSON 1 sóla vez y se almacena en esta variable 
// var botonesPromise = loadJSON("static/json/botones.json");

// FUNCIÓN PARA CREAR ELEMENTO DE TIPO botón
function createHtmlBoton (element) {
    // Crear botón (Creando todo el html directamente con función auxiliar)
    var newBotonString =  `<button 
                            class="${element.ownclass== undefined ? "" : element.ownclass} boton" `;
                            // onclick="${element.onclick == undefined ? "" : element.onclick}" 
    if (element.buttonid !== undefined) {
        newBotonString += `id="${element.buttonid}"`;
    }
    newBotonString+= `>${element.name}</button>`;
    return htmlToElement(newBotonString);
}

// FUNCIÓN PARA CREAR ELEMENTO HTML DE TIPO separador-horizontal
function createHtmlHorizontal () {
    // Definir string con el contenido HTML del divisor horizontal
    var newSeparadorString = `<hr/> <!-- Divisor horizontal -->`;
    return htmlToElement(newSeparadorString);
}

// FUNCIÓN PARA CREAR ELEMENTO HTML DE TIPO fila-position
function createHtmlFilaPosition (position) {
    // Crear botón de posición (Creando todo el html directamente con función auxiliar)
    var newRowString =  `<div class="fila">
                            <button>${position}</button>
                            <button onclick="clickCheckPosition('Position${position}')" id="ButtonPosition${position}">
                                <i class="fa fa-solid fa-check" id="Position${position}"></i>
                            </button>
                        </div>`;
    return htmlToElement(newRowString);
}


// Crear tantos botones fila-position como posiciones haya
function createHtmlFilaPositions (positions) {
    // Obtener nº de posiciones a crear
    // var positions = 155; // 165 totales - 10 de ejemplo del html

    // Cuál será el número del siguiente botón de posición que se tome de referencia de base (una unidad más de los que haya de base en el HTML)
    var nextPosition = document.getElementById("positions").childElementCount + 1;

    // Declarar el contenedor Html que contendrá a todas las filas de las posiciones
    var containerWithPositions = `<div class="positions" id="positions">`;
    var containerWithPositionsHtml = htmlToElement(containerWithPositions);

    // Tantas posiciones como haya, crear un botón
    for (var i=0; i < positions; i++) {
        // Obtener el elemento HTML de la fila con la posición indicada
        var newRowHtml = createHtmlFilaPosition(nextPosition);

        // Añadir el nuevo botón debajo de los anteriores, metiéndolo dentro del contenedor de todas las filas de las posiciones
        containerWithPositionsHtml.appendChild(newRowHtml);

        // Obtenemos la siguiente posición
        nextPosition++;
    }

    // Devolver elemento HTML con todas las filas de las posiciones en su contenedor
    return containerWithPositionsHtml;
}

// FUNCIÓN PARA CREAR ELEMENTO DE TIPO selector-capa
function createHtmlSelectorCapa () {
    // Definir un string con el contenido
    var newSelectorCapa =   `<div class="layers" id="layer-selector">
                                <div class="layers-botones" id="layers-botones"> <!-- Filas de botones de las capas / layers -->
                                    <strong>View</strong>
                                    <div class="fila" id="fila-capa1">
                                        <button>1</button>
                                        <button> <!-- Añadir cuando se elimine html original id="ButtonLayer1"-->
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

// FUNCIÓN PARA CREAR ELEMENTO DE TIPO slider-and-input Y slider-without-input (deslizador con o sin caja de texto input)
function createHtmlSlider (element) {
    // Definir un string con el contenido
    var newSlider = `<div class="panel">
                                <div class="centered boton form-control">
                                    <label for="${element.sliderid}" class="form-label">${element.name}</label>`;
    if (element.type.includes("and-input")) {
        newSlider +=               `<input type="number" class="slider-box" id="${element.inputid}" value="${element.defaultvalue}"/>`;
    }
    newSlider +=                   `<div class="slider-input">
                                        <div class="value left">${element.min}</div>
                                        <input type="range" min="${element.min}" max="${element.max}" value="${element.defaultvalue}" step="${element.step}" class="boton" id="${element.sliderid}"/>
                                        <div class="value right">${element.max}</div>
                                    </div>
                                </div>
                            </div>`;
    return htmlToElement(newSlider);
}

// FUNCIÓN PARA CREAR ELEMENTO DE TIPO panel
function createHtmlPanel (element) {
    // Definir un string con el contenido
    var newPanelString =   `<div class="centered border border-secondary" id="${element.panelid}"> <!-- Subpanel de ${element.name} -->`;

    // Añadir el nombre como título del panel (si tiene)
    if (element.name !== undefined) {
        newPanelString += `<label class="form-label">${element.name}</label>`;
    }
    newPanelString += `</div> <!-- Fin de subpanel ${element.name} -->`;

    return htmlToElement(newPanelString);
} 

// FUNCIÓN PARA CREAR ELEMENTO DE TIPO select-one Y select-multiple 
function createHtmlSelect (element) {
    // Definir un string con el contenido
    var newSelect = `<div class="panel">
                        <div class="boton ${element.border==false ? "": "form-control"}">`;
    if (element.name !== undefined) {
        newSelect +=           `<label for="${element.selectid}" class="form-label">${element.name}</label>`;
    }
    newSelect +=               `<select id="${element.selectid}" class="form-control" ${element.ownclass==undefined ? "" : element.ownclass}" `;
    if (element.type.includes("multiple")) {
        newSelect += `multiple`;
    }
    newSelect += `>`;
    for (var value of element.values) {
        newSelect +=            `<option ${value.predetselectedoption ? 'selected="selected"' : ""} value="${value.valueid}">${value.valuename}</option>`;
    }
    newSelect +=            `</select>
                        </div>
                    </div>`;
    return htmlToElement(newSelect);
}

// FUNCIÓN PARA CREAR ELEMENTO DE TIPO checkbox
function createHtmlCheckbox (element) {
    // Definir un string con el contenido
    var newCheckbox = `<div class="panel">
                            <input type="checkbox" id=${element.checkboxid} value=""/>
                            <label for=${element.checkboxid}>${element.name}</label>
                        </div>`;
    return htmlToElement(newCheckbox);
}


// FUNCIÓN PARA CREAR ELEMENTO DE TIPO text-input
function createHtmlTextInput (element) {
    // Definir un string con el contenido
    var newTextInput = `<div class="panel">
                            <label for=${element.inputid}>${element.name}:</label>
                            <input type="text" id=${element.inputid} placeholder=${element.placeholder}>
                        </div>`;
    return htmlToElement(newTextInput);
}

// FUNCIÓN PARA DEVOLVER UN ELEMENTO HTML DEL TIPO DEL ELEMENTO PASADO COMO PARÁMETRO
function appendElement(element) {
    // El/los botones/elementos HTML se irán almacenando como elementos de un array de JS
    var arrayElementosHtml = [];

    // Según el tipo de elemento que sea, así se llamará a su función correspondiente
    switch (element.type) {
        case 'boton': 
            arrayElementosHtml.push(createHtmlBoton(element));
            break;
        case 'fila-position':
            let positions = 155;
            arrayElementosHtml.push(createHtmlFilaPositions(positions));
            break;
        case 'selector-capa':
            arrayElementosHtml.push(createHtmlSelectorCapa());
            break;
        case 'slider-and-input':
        case 'slider-without-input':
            arrayElementosHtml.push(createHtmlSlider(element));
            break;
        case 'panel':
            // Creo sólo el HTML del contenedor del panel
            var panelHtml = createHtmlPanel(element);

            // Creo un array vacío donde se almacenarán los elementos HTML de los componentes contenidos en este panel
            var arrayComponentesHtml = [];

            // Por cada componente dentro del panel, almacenar su HTML en el array
            for (var component of element.components) {
                arrayComponentesHtml.push(appendElement(component));
            }

            // Meter todos los componentes dentro del panel
            for (var i = 0; i < arrayComponentesHtml.length; i++) {
                // Recorrer array de arrays de 1 elemento
                panelHtml.append(...arrayComponentesHtml[i]);
            }
            // Añado el HTML del panel conteniendo todos sus elementos
            arrayElementosHtml.push(panelHtml);
            break;
        case 'select-one':
        case 'select-multiple':
            arrayElementosHtml.push(createHtmlSelect(element));
            break;
        case 'separador-horizontal':
            arrayElementosHtml.push(createHtmlHorizontal());
            break;
        case 'text-input':
            arrayElementosHtml.push(createHtmlTextInput(element));
            break;
        case 'checkbox':
            arrayElementosHtml.push(createHtmlCheckbox(element));
            break;
        default:
            console.error('No se ha especificado ninguna función para añadir elementos HTML de ese tipo!');
    }
    return arrayElementosHtml;
}

// FUNCIÓN PARA CREAR TODOS LOS ELEMENTOS DE LAS PESTAÑAS DEL MENÚ DE LA DERECHA
async function appendAllElements() {
    // Esperar a que se cargue el archivo JSON con la información de los elementos / botones
    let botonesJson = await botonesPromise;

    // Recorrer el array de pestañas del archivo JSON
    for (var pestana of botonesJson) {
        //console.log('PESTAÑA:', pestana.Tab); // Mostrar en consola la pestaña que se está rellenando

        // Recorrer el array de los elementos de esa pestaña
        for (var element of pestana.Container) {
            // Obtener el elemento HTML o array de elementos HTML del tipo correspondiente
            var elementoAniadir = appendElement(element);
            // Añadir el elemento Html a la pestaña correspondiente
            document.getElementById(pestana.Tab).append(...elementoAniadir); // Los ... son cruciales si se añade un array de elementos HTML  
        }
    } 
}
// Llamada a la función para que cree todos los botones del menú de la derecha automáticamente con los datos del JSON
appendAllElements();

////////////////////////////////////////////////////////////////////////////////////
/////////       3.FUNCIONES PARA CADA PESTAÑA (EN ORDEN)      //////////////////////
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

    // Get all elements with class="pestana-link" and remove the class "active"
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
function clickCheckPosition (posNumber) {
    var iconTarget = document.getElementById(posNumber);
    // Si es tick, cambia a cruz. Si no, a la inversa
    if (iconTarget.classList.contains("fa-check")) {
        iconTarget.classList.replace("fa-check", "fa-times");
    } else {
        iconTarget.classList.replace("fa-times", "fa-check");
    }
}

//Función para cambiar los checks de todas las posiciones con botón valid. MENÚ POSITIONs
function clickCheckPositions() {
    var positions = document.getElementsByClassName("positions");
    var rows = positions[0].childElementCount; // El primer y único elemento "positions"
    for (let i = 0; i < rows; i++) {
        let string = "Position" + (i+1);
        // console.log(string); // Mostrar por consola la posición a la que se le ha cambiado el check
        clickCheckPosition(string);
    }
}


/************************************************ */
// PESTAÑA LAYERS
//Función para extraer el número entero del nombre de una capa (auxiliar para otras funciones)
function obtainNumberLayer(string) {
    // Extraer nº capa
    var stringNumber = string.slice(5); // Formato string (5 carácteres de 'Layer')
    return Number(stringNumber);        // Formato int
}

//Función para cambiar un ojo / ojo tachado del menú layers
function clickCheckLayer(layer) {
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
    if (materials[layerNumber].map.source.data !== null) { // Si se ha creado restricción en addNewLayerButtons(): materials[layerNumber] !== undefined
        materials[layerNumber].visible = (materials[layerNumber].visible == true) ? false : true;
        console.log('clickCheckLayer: está definido el material de esta capa. materials[layerNumber]: ', materials[layerNumber].map.source.data);
    } else {
        console.log('clickCheckLayer: El material de esta capa no está definido aún');
        document.getElementById("alertMaterialUndefined").style.display = "block";
    }
}

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
    
    // Eliminar los botones asociados a la capa eliminada
    var botonesCapa = document.getElementById("layers-botones").children.item(`${index + 1}`); // Los botones no se reindexan
    botonesCapa.remove();
}

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
function addNewLayerButtons (element) {
    //If está todo el formulario de la pestaña XRF relleno y señalado:
    //console.warning("Es obligatorio rellenar todas las opciones del formulario");

    // Crear el nombre de la capa nueva con una nueva opción de selección
    var newLayer = document.createElement("option");

    // Obtener el número y el nombre de la capa a crear
    var lastValue = document.querySelector("#layers-nombre > .layers-nombreopt:last-child").value; // E.g.: lastValue = layer2 (beginning at 0)
    var lastValueNumber = obtainNumberLayer(lastValue); // E.g.: lastValueNumber = 2
    var newLayerValue = 'layer' + (lastValueNumber + 1); // E.g.: newLayerValue = layer3

    // Asignar atributos a la capa nueva a crear
    newLayer.setAttribute("class", "layers-nombreopt");
    newLayer.setAttribute("value", newLayerValue);

    // Nombre de la capa. Si campo view name de pestaña XRF tiene valor, llamar así a capa. Si no, nombre por defecto
    var layerName;
    if (document.getElementById("view-name-xrf").value == '') {
        layerName = "vis_visible";
    } else {
        layerName = replaceSpaces(document.getElementById("view-name-xrf").value);
    }
    element = element == '' ? 'base' : element;
    var newLayernameText = document.createTextNode(layerName + "_" + (lastValueNumber + 1) + "_" + element);
    newLayer.appendChild(newLayernameText);

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
                                <button id="ButtonLayer${lastValueNumber + 2}">
                                    <i class="fa fa-eye-slash" id="Layer${lastValueNumber + 2}"></i>
                                </button>
                            </div>`;
    var newRowHtml = htmlToElement(newRowString); // ids comenzando en 1

    // Crear botones añadiéndolos debajo de los anteriores
    document.getElementById("layers-botones").appendChild(newRowHtml);  

    return newLayernameText;
}

// Load and show image of new layer with Three.js
function addNewLayerImage (element, temp_filename_path) {
    // Asociar elemento al array de capas (clase implementada)
    var layerAux = new AuxiliaryLayer("vis_visible", element, AuxiliaryLayer.InterpolationType.MinCartesianDistance, false, AuxiliaryLayer.PosNormalization.Homogeneous, AuxiliaryLayer.Probe[1], AuxiliaryLayer.Palette.Discrete_color_2_interval);
    arrayLayers.push(layerAux);

    // Crear y añadir la textura al array de capas de Three.js
    var textureImage = new THREE.TextureLoader().load('/' + temp_filename_path);
    textureImage.format = THREE.RGBAFormat;
    textureImage.colorSpace = THREE.SRGBColorSpace;
    var materialImage = new THREE.MeshBasicMaterial( { 
        map: textureImage,
        depthTest: false,
        transparent: true,
        visible: false
    });

    plano.addGroup( 0, Infinity, materials.length ); // Debería ser lastValueNumber
    materials.push(materialImage);

    mesh3 = new THREE.Mesh( plano, materials ); //se van creando objetos que sobrecargan el programa. Destruirlos
    scene.add( mesh3 );
}

/*
// Comportamiento al clicar el botón 'Create Some Maps' de XRF
document.getElementById("create-some-maps").onclick = function () {
    // Obtener todos los elementos seleccionados (uno o múltiples elementos seleccionados)
    var collection = document.getElementById("select-elements").selectedOptions;

    // Crear una nueva capa por cada elemento seleccionado
    for (var i = 0; i < collection.length; i++) {
        console.log("Añadiendo la capa del elemento: ", collection[i].value);
        addNewLayerButtons(collection[i].value);
    }
};
*/
/*
// Comportamiento al clicar el botón 'Create all maps' de XRF
document.getElementById("create-all-maps").onclick = function () {
    console.log(document.getElementById("select-elements").options.length, "elementos nuevos"); // 18 elementos
    // Crear una nueva capa por cada elemento que haya en el selector de elementos
    for (var i = 0; i < document.getElementById("select-elements").options.length; i++) {
        addNewLayerButtons(document.getElementById("select-elements").options[i].value);
    }
};
*/

////////////////////////////////////////////////////////////////////////////////////
/////////      4.FUNCIONES PARA CANVAS PRINCIPAL (THREE.JS)      ///////////////////
////////////////////////////////////////////////////////////////////////////////////

/************************************************ */
// FUNCIONALIDADES PARA EL CANVAS
// Global variable to store path of layer images and its names
var cache_image_path = [];
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
const textura = new THREE.TextureLoader().load('/static/images_backup/transfiguracion.png');
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
// var darthvader = new THREE.TextureLoader().load('/static/images/darth-vader.png');
// darthvader.format = THREE.RGBAFormat;
// darthvader.colorSpace = THREE.SRGBColorSpace;
// var materialvader = new THREE.MeshBasicMaterial( { 
//     map: darthvader,
//     depthTest: false,
//     transparent: true,
//     visible: false
// });
//var mesh = new THREE.Mesh(plano, materialvader);
//scene.add(mesh);

// Crear textura y material con Darth Vader 2
// var darthvader2 = new THREE.TextureLoader().load('/static/images/darth-vader2.png');
// var materialvader2 = new THREE.MeshBasicMaterial( {
//     map: darthvader2,
//     depthTest: false,
//     transparent: true,
//     visible: false
// });
//var mesh2 = new THREE.Mesh(plano, materialvader2);
//scene.add(mesh2);
///////////////////////////////////////////////////////////////////////
///VERSIÓN ALTERNATIVA MULTICAPAS CON TEXTURAS DISTINTAS Y TRANSPARENCIA SOBRE EL MISMO PLANO
plano.clearGroups();
plano.addGroup( 0, Infinity, 0 );
// plano.addGroup( 0, Infinity, 1 );
// plano.addGroup( 0, Infinity, 2 );

var materials = [ material];//, materialvader, materialvader2 ];

// mesh
var mesh3 = new THREE.Mesh( plano, materials );
scene.add( mesh3 );

// Crear array de objetos con clase personalizada para las capas
var layer0 = new AuxiliaryLayer("vis_visible", "Ca", AuxiliaryLayer.InterpolationType.MinCartesianDistance, false, AuxiliaryLayer.PosNormalization.Homogeneous, AuxiliaryLayer.Probe[1], AuxiliaryLayer.Palette.Discrete_color_2_interval);
// var layer1 = new AuxiliaryLayer("vis_visible", "Ti", AuxiliaryLayer.InterpolationType.MinCartesianDistance, false, AuxiliaryLayer.PosNormalization.Homogeneous, AuxiliaryLayer.Probe[1], AuxiliaryLayer.Palette.Discrete_color_2_interval);
// var layer2 = new AuxiliaryLayer("vis_visible", "Hg", AuxiliaryLayer.InterpolationType.MinCartesianDistance, false, AuxiliaryLayer.PosNormalization.Homogeneous, AuxiliaryLayer.Probe[1], AuxiliaryLayer.Palette.Discrete_color_2_interval);
var arrayLayers = [layer0];//, layer1, layer2];
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
/////////      5.FUNCIONES DEL MENÚ DE LA IZQUIERDA (BARRA DE COLOR)    ////////////
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


// DETECCIÓN DE EVENTOS DE CADA BOTÓN / ELEMENTO PARA NOTIFICAR AL SERVIDOR
// Detectar si los botones de la aplicación han sido clicados y actualizar al servidor

/****************************** */
// PESTAÑA POSITIONS: EVENTOS DE SUS ELEMENTOS / BOTONES
// Botón valid
document.getElementById("valid-boton").addEventListener("click", function () {
    var tabNumber = 0;          // El botón Valid se encuentra en Pestaña Positions, la 0 en el JSON
    var buttonOrderNumber = 0;  // Posición del botón Valid en el orden de aparición de botones de cada pestaña (aparece el primero)
    jsonStatus.Button_onclick(tabNumber, buttonOrderNumber, "valid-boton");

    clickCheckPositions();
});

//Función para extraer el número entero del nombre de una capa (auxiliar para otras funciones)
function obtainNumberPositionId(string) {
    // Extraer nº position del id de su botón
    var stringNumber = string.slice(14); // Formato string (14 carácteres del comienzo 'ButtonPosition')
    return Number(stringNumber);        // Formato int
}

// Todos los elementos fila positions. Al clicar el segundo botón (el que contiene el icono) de la fila se identifica qué posición es
document.querySelectorAll("#Positions > #positions > .fila button:nth-child(2)").forEach(function(element) {
    //addEventListener sólo para el botón que se ha clicado dentro del conjunto de botones posibles de todas las filas de posiciones
    element.addEventListener("click", function() {
        console.log('he clicado la posición tal', this.id);
        var tabNumber = 0;          // El panel de positions se encuentra en Pestaña Positions, la 0 en el JSON
        var buttonOrderNumber = 1;  // Posición del panel positions en el orden de aparición de cada pestaña (comienza en 0)
        var buttonIdNumber = obtainNumberPositionId(this.id) - 1; // Obtener el '6' de ButtonPosition6
        jsonStatus.FilaPosition_onclick(tabNumber, buttonOrderNumber, buttonIdNumber, this.id);
    });
});

// Botón Update Data de la pestaña Positions
document.getElementById("update-boton").addEventListener("click", function() {
    var tabNumber = 0;          // El botón Update Data se encuentra en Pestaña Positions, la 0 en el JSON
    var buttonOrderNumber = 3;  // Posición del botón Update en el orden de aparición de cada pestaña del JSON (comienza en 0)
    jsonStatus.Button_onclick(tabNumber, buttonOrderNumber, "update-boton");
});

/****************************** */
// FUNCIONES COMUNES PARA LOS DETECTORES DE EVENTOS
// Función para SELECTORES MÚLTIPLES 
function getSelectedOptions(sel) {
    var opts = [], opt;
    for (var i = 0; i < sel.options.length; i++) {
        opt = sel.options[i];
        opts.push({"valueid": opt.value,
                    "status": "not-clicked"}); // Array de JSON provisional, paralelo al original. Con todos los status de todas las opciones
    
        if (opt.selected) {
            opts[i].status = "clicked";   // Índice empezando en 0 de la opción seleccionada
        }
    }        
    return opts; // Obtener un array provisional con los status actualizados de las opciones seleccionadas
}

// Función para SELECTORES INDIVIDUALES
function getSelectedOption(sel) {
    var opt;
    for (var i = 0; i < sel.options.length; i++) {
        opt = sel.options[i];
    
        if (opt.selected) {
            return i; // Posición comenzando en 0 de la opción seleccionada dentro del select
        }
    }
}

// Función para sustituir espacios en blanco de un string por _
function replaceSpaces(str) {
    return str.split(' ').join('_');
}


/****************************** */
// PESTAÑA LAYERS: EVENTOS DE SUS ELEMENTOS / BOTONES
// BOTONES DE VISIBILIDAD DEL SELECTOR DE CAPAS, PESTAÑA LAYERS
// document.getElementById("ButtonLayer").addEventListener("click", function() {

// document.querySelectorAll("#Layers > #layer-selector > #layers-botones > .fila button:nth-child(2)").forEach(function(element) {
// document.querySelectorAll('[id^="ButtonLayer"]').forEach(function(element) {
document.querySelector("#Layers > #layer-selector > #layers-botones").addEventListener("click", function(evt) {
    // e.target was the clicked element
    //addEventListener sólo para el botón que se ha clicado dentro del conjunto de botones posibles
    if (evt.target && (evt.target.id.startsWith("ButtonLayer") || evt.target.id.startsWith("Layer"))) {
        var tabNumber = 1;          // El panel de selector-capa se encuentra en Pestaña Layers, la 1 en el JSON
        var buttonOrderNumber = 0;  // Posición del panel selector en el orden de aparición de cada pestaña (comienza en 0)
        if (evt.target.id.startsWith("ButtonLayer")) {
            var layerId = evt.target.firstElementChild.id;  // Obtener Layer5
        } else {
            var layerId = evt.target.id; 
        }
        var buttonIdNumber = obtainNumberLayer(layerId) - 1; // Obtener el '6' de Layer6
        jsonStatus.FilaSelectorCapa_onclick(tabNumber, buttonOrderNumber, buttonIdNumber, evt.target.id);
    }
});

// SELECTOR INDIVIDUAL DE CAPAS (seleccionar sólo nombre de capas)
document.getElementById("layers-nombre").addEventListener("change", function() {
    var selectedOption = getSelectedOption(this);
    var tabNumber = 1;      // Pestaña Layers en el JSON, empezando en 0
    var elementOrderNumber = 0; // Nº orden del elemento en la pestaña en el JSON
    jsonStatus.Select_onchange(tabNumber, elementOrderNumber, selectedOption, this);
});

// INPUT DEL SLIDER TRAANSPARENCY, PESTAÑA LAYERS
document.getElementById("transparency-value").addEventListener("input", function() {
    var tabNumber = 1;          // Pestaña Layers en el JSON, empezando en 0
    var elementOrderNumber = 1; // Nº orden de elemento en la pestaña en el JSON (comienza en 0)
    jsonStatus.TextInput_oninput(tabNumber, elementOrderNumber, undefined, this);
});

// SLIDER CON INPUT DE TRANSPARENCY, PESTAÑA LAYERS
document.getElementById("slide-transparency").addEventListener("change", function() {
    var tabNumber = 1;          // Pestaña Layers en el JSON, empezando en 0
    var elementOrderNumber = 1; // Nº orden de elemento en la pestaña en el JSON (comienza en 0)
    var slider_value = this.value;
    jsonStatus.SliderAndInput_onchange(tabNumber, elementOrderNumber, slider_value);
});

// SLIDER SIN INPUT DE MAX THRESHOLD
document.getElementById("slide-min-threshold").addEventListener("change", function() {
    var tabNumber = 1;          // Pestaña Layers en el JSON, empezando en 0
    var elementOrderNumber = 2; // Nº orden del PANEL que contiene este elemento en el JSON
    var panelOrderNumber = 0;   // Nº orden dentro de los elementos del PANEL en el JSON
    var slider_value = this.value;
    jsonStatus.SliderWithoutInput_onchange(tabNumber, elementOrderNumber, panelOrderNumber, slider_value);
});

// SLIDER SIN INPUT DE MAX THRESHOLD
document.getElementById("slide-max-threshold").addEventListener("change", function() {
    var tabNumber = 1;          // Pestaña Layers en el JSON, empezando en 0
    var elementOrderNumber = 2; // Nº orden del PANEL que contiene este elemento en el JSON
    var panelOrderNumber = 1;   // Nº orden dentro de los elementos del PANEL en el JSON
    var slider_value = this.value;
    jsonStatus.SliderWithoutInput_onchange(tabNumber, elementOrderNumber, panelOrderNumber, slider_value);
});

// SELECTOR INDIVIDUAL DE DATA TYPE PRINT, PESTAÑA LAYERS
document.getElementById("data-type").addEventListener("change", function() {
    var selectedOption = getSelectedOption(this);
    var tabNumber = 1;      // Pestaña Layers en el JSON, empezando en 0
    var elementOrderNumber = 2;  // Nº orden del PANEL que contiene este elemento en el JSON
    var panelOrderNumber = 2;   // Nº orden dentro de los elementos del PANEL en el JSON
    jsonStatus.Select_onchange(tabNumber, elementOrderNumber, selectedOption, this, panelOrderNumber);
});

// CHECKBOX DE PIXEL TRANSPARENCY
document.getElementById("pixel-transparency").addEventListener("change", function () {
    var tabNumber = 1;      // Pestaña Layers en el JSON, empezando en 0
    var elementOrderNumber = 3; // Nº orden del PANEL que contiene este elemento en el JSON
    var panelOrderNumber = 0;   // Nº orden dentro de los elementos del PANEL en el JSON
    jsonStatus.Checkbox_onchange(tabNumber, elementOrderNumber, panelOrderNumber);
});

// INPUT DEL SLIDER GAUSSIAN THRESHOLD
document.getElementById("gaussian-threshold-value").addEventListener("input", function() {
    var tabNumber = 1;          // Pestaña Layers en el JSON, empezando en 0
    var elementOrderNumber = 3; // Nº orden del PANEL que contiene este elemento en el JSON
    var panelOrderNumber = 1;   // Nº orden dentro de los elementos del PANEL en el JSON
    jsonStatus.TextInput_oninput(tabNumber, elementOrderNumber, panelOrderNumber, this);
});

// SLIDER CON INPUT DE GAUSSIAN THRESHOLD
document.getElementById("gaussian-threshold").addEventListener("change", function() {
    var tabNumber = 1;          // Pestaña Layers en el JSON, empezando en 0
    var elementOrderNumber = 3; // Nº orden del PANEL que contiene este elemento en el JSON
    var panelOrderNumber = 1;   // Nº orden dentro de los elementos del PANEL en el JSON
    var slider_value = this.value;
    jsonStatus.SliderAndInput_onchange(tabNumber, elementOrderNumber, slider_value, panelOrderNumber);
});

// INPUT DEL SLIDER BIG GAUSSIAN SIZE
document.getElementById("big-gaussian-value").addEventListener("input", function() {
    var tabNumber = 1;          // Pestaña Layers en el JSON, empezando en 0
    var elementOrderNumber = 3; // Nº orden del PANEL que contiene este elemento en el JSON
    var panelOrderNumber = 2;   // Nº orden dentro de los elementos del PANEL en el JSON
    jsonStatus.TextInput_oninput(tabNumber, elementOrderNumber, panelOrderNumber, this);
});

// SLIDER CON INPUT DE BIG GAUSSIAN SIZE
document.getElementById("big-gaussian-size").addEventListener("change", function() {
    var tabNumber = 1;          // Pestaña Layers en el JSON, empezando en 0
    var elementOrderNumber = 3; // Nº orden del PANEL que contiene este elemento en el JSON
    var panelOrderNumber = 2;   // Nº orden dentro de los elementos del PANEL en el JSON
    var slider_value = this.value;
    jsonStatus.SliderAndInput_onchange(tabNumber, elementOrderNumber, slider_value, panelOrderNumber);
});

// INPUT DEL SLIDER SMALL GAUSSIAN SIZE
document.getElementById("small-gaussian-value").addEventListener("input", function() {
    var tabNumber = 1;          // Pestaña Layers en el JSON, empezando en 0
    var elementOrderNumber = 3; // Nº orden del PANEL que contiene este elemento en el JSON
    var panelOrderNumber = 3;   // Nº orden dentro de los elementos del PANEL en el JSON
    jsonStatus.TextInput_oninput(tabNumber, elementOrderNumber, panelOrderNumber, this);
});

// SLIDER CON INPUT DE SMALL GAUSSIAN SIZE
document.getElementById("small-gaussian-size").addEventListener("change", function() {
    var tabNumber = 1;          // Pestaña Layers en el JSON, empezando en 0
    var elementOrderNumber = 3; // Nº orden del PANEL que contiene este elemento en el JSON
    var panelOrderNumber = 3;   // Nº orden dentro de los elementos del PANEL en el JSON
    var slider_value = this.value;
    jsonStatus.SliderAndInput_onchange(tabNumber, elementOrderNumber, slider_value, panelOrderNumber);
});

// SELECTOR INDIVIDUAL INTERPOLATION TYPE
document.getElementById("add-aux-layers").addEventListener("change", function() {
    var selectedOption = getSelectedOption(this);
    var tabNumber = 1;      // Pestaña Layers en el JSON, empezando en 0
    var elementOrderNumber = 5; // Nº orden del elemento en la pestaña en el JSON
    jsonStatus.Select_onchange(tabNumber, elementOrderNumber, selectedOption, this);
});

// BOTÓN REMOVE SELECTED LAYER DE LA PESTAÑA LAYERS
document.getElementById("remove-selected-layer").addEventListener("click", function() {
    var tabNumber = 1;          // El botón Remove Selected Layer se encuentra en Pestaña Layers, la 1 en el JSON (comienza en 0)
    var buttonOrderNumber = 6;  // Nº orden de elemento en la pestaña en el JSON (comienza en 0)
    jsonStatus.Button_onclick(tabNumber, buttonOrderNumber, "remove-selected-layer");

    // Seleccionar el índice y nombre de la capa seleccionada
    var removedIndex = document.getElementById("layers-nombre").selectedIndex; //selectedIndex es dinámico, se reindexa al borrar una opción
    let removedLayerName = document.getElementById("layers-nombre").options[removedIndex].text;

    // // Get the path of the layer image to be removed
    // for (let i = 0; i < cache_image_path.length; i++) {
    //     if (cache_image_path[i].layerName === removedLayerName) {
    //         var removedLayerPath =  cache_image_path[i].layerStaticPath;
    //     }
    // }

    // Informar al servidor para que elimine archivo de imagen de capa eliminada. No se espera respuesta
    // fetch("/delete_layer", {headers: {"Content-Type": "application/json"}, body: JSON.stringify(removedLayerPath), credentials: "include"});

    // Delete layer from the cache
    console.log('cache antes del filtro de delete', cache_image_path);
    cache_image_path = cache_image_path.filter(cache_image_path => cache_image_path.layerName !== removedLayerName);
    console.log('cache ha quedaado así despues del filtro de delete', cache_image_path, 'nombre buscado', removedLayerName, removedLayerPath);

    // Eliminar botones y nombre de la interfaz asociados a esa capa
    removeLayer(removedIndex);    
});

// BOTÓN REMOVE SELECTED LAYER DE LA PESTAÑA LAYERS
document.getElementById("remove-all-layers").addEventListener("click", function() {
    var tabNumber = 1;          // El botón Remove Selected Layer se encuentra en Pestaña Layers, la 1 en el JSON (comienza en 0)
    var buttonOrderNumber = 7;  // Nº orden de elemento en la pestaña en el JSON (comienza en 0)
    jsonStatus.Button_onclick(tabNumber, buttonOrderNumber, "remove-all-layers");
});

/****************************** */
// PESTAÑA XRF: EVENTOS DE SUS ELEMENTOS / BOTONES
// SELECTOR MÚLTIPLE DE ELEMENTS DE XRF
document.getElementById("select-elements").addEventListener("change", function() {
    var selectedOptions = getSelectedOptions(this);
    var tabNumber = 2;      // Pestaña XRF en el JSON, empezando en 0
    var elementOrderNumber = 0;  // Nº orden del elemento en la pestaña en el JSON
    jsonStatus.SelectMultiple_onchange(tabNumber, elementOrderNumber, selectedOptions, this);
});

// VIEW NAME TEXT INPUT DE XRF
document.getElementById("view-name-xrf").addEventListener("blur", function() {
    var tabNumber = 2;      // Pestaña Compounds en el JSON, empezando en 0
    var elementOrderNumber = 1; // Nº orden del elemento en la pestaña en el JSON
    jsonStatus.TextInput_oninput(tabNumber, elementOrderNumber, undefined, this);
});

// SELECTOR INDIVIDUAL INTERPOLATION TYPE
document.getElementById("interpolation").addEventListener("change", function() {
    var selectedOption = getSelectedOption(this);
    var tabNumber = 2;      // Pestaña XRF en el JSON, empezando en 0
    var elementOrderNumber = 2; // Nº orden del elemento en la pestaña en el JSON
    jsonStatus.Select_onchange(tabNumber, elementOrderNumber, selectedOption, this);
});

// CHECKBOX NORMALIZATION
document.getElementById("normalization").addEventListener("change", function () {
    var tabNumber = 2;      // Pestaña XRF en el JSON, empezando en 0
    var elementOrderNumber = 3; // Nº orden del elemento en la pestaña en el JSON
    jsonStatus.Checkbox_onchange(tabNumber, elementOrderNumber);
});

// SELECTOR INDIVIDUAL POS.NORMALIZATION
document.getElementById("pos-normalization").addEventListener("change", function() {
    var selectedOption = getSelectedOption(this);
    var tabNumber = 2;      // Pestaña XRF en el JSON, empezando en 0
    var elementOrderNumber = 4; // Nº orden del elemento en la pestaña en el JSON
    jsonStatus.Select_onchange(tabNumber, elementOrderNumber, selectedOption, this);
});

// SELECTOR INDIVIDUAL PROBE DE XRF
document.getElementById("probe-xrf").addEventListener("change", function() {
    var selectedOption = getSelectedOption(this);
    var tabNumber = 2;      // Pestaña Compounds en el JSON, empezando en 0
    var elementOrderNumber = 5; // Nº orden del elemento en la pestaña en el JSON
    jsonStatus.Select_onchange(tabNumber, elementOrderNumber, selectedOption, this);
});

// SELECTOR INDIVIDUAL PALETTE DE XRF
document.getElementById("palette-xrf").addEventListener("change", function() {
    var selectedOption = getSelectedOption(this);
    var tabNumber = 2;      // Pestaña Compounds en el JSON, empezando en 0
    var elementOrderNumber = 6; // Nº orden del elemento en la pestaña en el JSON
    jsonStatus.Select_onchange(tabNumber, elementOrderNumber, selectedOption, this);
});

// BOTÓN CREATE SOME MAPS DE LA PESTAÑA XRF
document.getElementById("create-some-maps").addEventListener("click", function() {
    var tabNumber = 2;          // El botón Create Some Maps de XRF se encuentra en Pestaña XRF, la 2 en el JSON (comienza en 0)
    var buttonOrderNumber = 8;  // Nº orden de elemento en la pestaña en el JSON (comienza en 0)
    jsonStatus.Button_onclick(tabNumber, buttonOrderNumber, "create-some-maps");

    // Obtener todos los elementos seleccionados (uno o múltiples elementos seleccionados)
    var collection = document.getElementById("select-elements").selectedOptions;

    // Crear una nueva capa por cada elemento seleccionado en la interfaz
    for (var i = 0; i < collection.length; i++) {
        // Inform the server, generate temp image, create buttons of layer in UI and save it in cache dictionary
        addNewLayer(collection[i].value);
    }
});

// BOTÓN CREATE SOME MAPS DE LA PESTAÑA XRF
document.getElementById("create-all-maps").addEventListener("click", function() {
    var tabNumber = 2;          // El botón Create All Maps de XRF se encuentra en Pestaña XRF, la 2 en el JSON (comienza en 0)
    var buttonOrderNumber = 9;  // Nº orden de elemento en la pestaña en el JSON (comienza en 0)
    jsonStatus.Button_onclick(tabNumber, buttonOrderNumber, "create-all-maps");
});

/****************************** */
// PESTAÑA COMPOUNDS: EVENTOS DE SUS ELEMENTOS / BOTONES
// SELECTOR MÚLTIPLE DE COMPOUNDS
document.getElementById("select-compounds").addEventListener("change", function() {
    var selectedOptions = getSelectedOptions(this);
    var tabNumber = 3;      // Pestaña Compounds en el JSON, empezando en 0
    var elementOrderNumber = 0;  // Nº orden del elemento en la pestaña en el JSON
    jsonStatus.SelectMultiple_onchange(tabNumber, elementOrderNumber, selectedOptions, this);
});

// VIEW NAME TEXT INPUT DE COMPOUNDS
document.getElementById("view-name-compounds").addEventListener("input", function() {
    var tabNumber = 3;      // Pestaña Compounds en el JSON, empezando en 0
    var elementOrderNumber = 1; // Nº orden del elemento en la pestaña en el JSON
    jsonStatus.TextInput_oninput(tabNumber, elementOrderNumber, undefined, this);
});

// SELECTOR INDIVIDUAL PROBE DE COMPOUNDS
document.getElementById("probe-compounds").addEventListener("change", function() {
    var selectedOption = getSelectedOption(this);
    var tabNumber = 3;      // Pestaña Compounds en el JSON, empezando en 0
    var elementOrderNumber = 2; // Nº orden del elemento en la pestaña en el JSON
    jsonStatus.Select_onchange(tabNumber, elementOrderNumber, selectedOption, this);
});

// SELECTOR INDIVIDUAL PALETTE DE COMPOUNDS
document.getElementById("palette-compounds").addEventListener("change", function() {
    var selectedOption = getSelectedOption(this);
    var tabNumber = 3;      // Pestaña Compounds en el JSON, empezando en 0
    var elementOrderNumber = 3; // Nº orden del elemento en la pestaña en el JSON
    jsonStatus.Select_onchange(tabNumber, elementOrderNumber, selectedOption, this);
});

// BOTÓN CREATE COMBINATION MAPS DE LA PESTAÑA COMPOUNDS
document.getElementById("create-combination-maps").addEventListener("click", function() {
    var tabNumber = 3;          // El botón Create Combination Maps de Compounds se encuentra en Pestaña Compounds, la 3 en el JSON (comienza en 0)
    var buttonOrderNumber = 5;  // Nº orden de elemento en la pestaña en el JSON (comienza en 0)
    jsonStatus.Button_onclick(tabNumber, buttonOrderNumber, "create-combination-maps");
});

// BOTÓN CREATE ALL INDIVIDUAL MAPS DE LA PESTAÑA COMPOUNDS
document.getElementById("create-all-individual-maps").addEventListener("click", function() {
    var tabNumber = 3;          // El botón Create All individual Maps de Compounds se encuentra en Pestaña Compounds, la 3 en el JSON (comienza en 0)
    var buttonOrderNumber = 6;  // Nº orden de elemento en la pestaña en el JSON (comienza en 0)
    jsonStatus.Button_onclick(tabNumber, buttonOrderNumber, "create-all-individual-maps");
});

async function addNewLayer (selectedElement) {
    // Send parameters of the values of the elements in the XRF Tab to the server
    var parameters = {};
    parameters["Output_name"] = document.getElementById("view-name-xrf").value == '' ? "vis_visible" : replaceSpaces(document.getElementById("view-name-xrf").value);
    parameters["Element_name"] = selectedElement;
    parameters["normalization"] = document.getElementById("normalization").checked;
    parameters["position_normalization"] = document.getElementById("pos-normalization").options[getSelectedOption(document.getElementById("pos-normalization"))].value; // Get value name of selected option
    parameters["probe"] = document.getElementById("probe-xrf").options[getSelectedOption(document.getElementById("probe-xrf"))].value; // Get value name of selected option
    parameters["palette_number"] = document.getElementById("palette-xrf").options[getSelectedOption(document.getElementById("palette-xrf"))].value;

    // Get the id of the current project from the url // Extraer id del proyecto actual de la url
    parameters["idCurrentProject"] = getProjectId();

    // Saves the output image in current project folder
    let sent_parameters = await exec_server("/exec_server", parameters);
    console.log('El front end ha recibido del servidor tras ejecutar los parámetros: ', sent_parameters)

    // Añadir botones de capa en interfaz y obtener nombre de capa. Formato: vis_visible_5_Cd
    let newLayernameText = addNewLayerButtons(selectedElement);
    addNewLayerImage(selectedElement, sent_parameters["temp_filename_path"]);
                   
    // Store relationship between layer name and its path of static folder in global cache variable
    let new_cache_entry = {
        layerName: newLayernameText,
        layerStaticPath: sent_parameters["temp_filename_path"]
    }

    cache_image_path.push(new_cache_entry);
}

////////////////////////////////////////////////////////////////////////////////////
/////////////      6.FUNCIONES ASÍNCRONAS CON AJAX (FETCH)    //////////////////
////////////////////////////////////////////////////////////////////////////////////


async function myButtonEvt (url= "", data = {}) {
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
            credentials: "include", // incluirá el id de sesión del usuario
        });
        if (!response.ok) {
            console.error("Respuesta de red OK pero respuesta HTTP no OK", response.status);
        }
        const buttons = await response.json();

        return buttons;
    } catch (error) {
        console.error("Hubo un problema con la petición Fetch: " + error.message);
    }    
}

async function exec_server (url="", parameters = {}) {
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(parameters),
            credentials: "include", // incluirá el id de sesión del usuario
        });
        if (!response.ok) {
            console.error("Respuesta de red OK pero respuesta HTTP no OK. En envío petición AJAX a servidor", response.status);
        }
        const sent_parameters = await response.json();
        return sent_parameters;
    } catch (error) {
        console.error("Hubo un problema con la petición Fetch del envío a ejecución del servidor: " + error.message);
    }    
}



////////////////////////////////////////////////////////////////////////////////////
/////////////  7.FUNCIONES ASÍNCRONAS CON AJAX (FETCH): LONG POLLING  ///////////////
////////////////////////////////////////////////////////////////////////////////////
async function longpolling() {
    try {
        let response = await fetch("/longpolling", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({"mi peticion": "al longpolling"}),
            // credentials: "include"
        });

        if (!response.ok) {
            console.error("Respuesta de red OK pero respuesta HTTP no ok (longpollin)", response.status);
        }

        if (response.status == 502) {
            // El estado 502 es un error de "tiempo de espera agotado" en la conexión,
            // puede suceder cuando la conexión estuvo pendiente durante demasiado tiempo,
            // y el servidor remoto o un proxy la cerró
            // vamos a reconectarnos
            longpolling();
        } else if (response.status != 200) {
            // Un error : vamos a mostrarlo
            console.error(response.statusText);
            // Vuelve a conectar en un segundo
            await new Promise(resolve => setTimeout(resolve, 100000));
            longpolling();
        } else {
            // Recibe y muestra el mensaje
            // let message = await response.json();
            // console.error(message);
            // Llama a longpolling() nuevamente para obtener el siguiente mensaje
            // longpolling();
        }

        let newButtons = await response.json();
        // longpolling();
        return newButtons;

    } catch (error) {
        console.error("Hubo un problema con la petición Fetch: " + error.message);
    }  
}
/*
    if (response.status == 502) {
        // El estado 502 es un error de "tiempo de espera agotado" en la conexión,
        // puede suceder cuando la conexión estuvo pendiente durante demasiado tiempo,
        // y el servidor remoto o un proxy la cerró
        // vamos a reconectarnos
        longpolling();
    } else if (response.status != 200) {
        // Un error : vamos a mostrarlo
        console.error(response.statusText);
        // Vuelve a conectar en un segundo
        await new Promise(resolve => setTimeout(resolve, 100000));
        longpolling();
    } else {
        // Recibe y muestra el mensaje
        let message = await response.text();
        console.error(message);
        // Llama a longpolling() nuevamente para obtener el siguiente mensaje
        // longpolling();
    }
*/
/*
async function myButtonEvt (url= "", data = {}) {
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
            //credentials: "include", // incluirá el id de sesión del usuario
        });
        if (!response.ok) {
            console.error("Respuesta de red OK pero respuesta HTTP no OK", response.status);
        }
        // console.log('Igualmente el response es: ', response.text());
        const buttons = await response.json();
        // console.log('Buttons: ', buttons);
        // console.log("Éxito: ", buttons);

        return buttons;
    } catch (error) {
        console.error("Hubo un problema con la petición Fetch: " + error.message);
    }    
}
*/

let LPResponse = await longpolling();
console.log(LPResponse);
