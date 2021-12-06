/*Declaro Variables iniciales*/
let pesos = 0; 
let banco = "";
let cotizacion = 0;
let confirmacion = false;
let tasaFinal = 0;
var tasa = 0;
var tasaEspecial = 0;
var total = 0;
var transaccion1="";

/*Funciones*/
function obtenerDatos(){ //Traigo los datos desde el HTML y valido si están en blanco o no. 
    pesos = $("#pesos").val();
    banco = $("#banco").val();
    if (pesos == "") {
        pesos = false;    
    } else {
        return pesos;
        
    }
    if(banco != "") {
        return banco;
    }else{ 
        banco = false;
    }
}

function calculoTasa(){ //Determino si el monto amerita tasa especial o no.
    if (pesos >= 10000) {
        tasaFinal = tasaEspecial;
    } else {
        tasaFinal = tasa;
    }
    return tasaFinal;
}


class Transaccion { //Objeto para almacenar la información sobre la transacción. 
    constructor (pesos, banco, tasaFinal,cotizacion){
        this.pesos = parseFloat(pesos);
        this.banco = banco;
        this.tasaFinal = parseFloat(tasaFinal);
        this.cotizacion = []; // El array se irá llenando con el resultado del método calculoFinal
    }

    calculoFinal(){ //Hago el cálculo y retorno el total de Bs a recibir.
        var cotizacion = parseFloat(this.pesos * this.tasaFinal);
        this.cotizacion.push(cotizacion.toFixed(2));
        return cotizacion;
    }
}

function eliminarElemento(id){ //Funcion para usar cuando quiera eliminar un elemento del HTML por ID
	bloque = document.getElementById(id);	
	if (!bloque){
		alert("El elemento selecionado no existe");
	} else {
		padre = bloque.parentNode;
		padre.removeChild(bloque);
	}
}


const arrayResumen = [];//Array de Objetos  para ir almacenando cada transacción confirmada.

function calcular(){ //Función que se ejecutará al darle al botón Calcular.
    obtenerDatos();
    if ((pesos === false) || (banco == false)){ //Si algún campo está incompleto muestro un mensaje en el modal y corto la función.
        $("#pasoDos").html("<p class='text-center'> Debes completar los datos solicitados</p>")
        $("#botonConfirm").html("Aceptar") //Cambio el texto del botón a "Aceptar" en lugar de "Confirmar"
        return;
    } else {
        $("#botonConfirm").html("Confirmar") //Restauro el texto del botón a "Confirmar"
        calculoTasa(0.021);
        transaccion1 = new Transaccion (pesos, banco, tasaFinal, cotizacion); //Llamo al objeto Transacción
        transaccion1.calculoFinal(); //Llamo al método del objeto Transacción para obtener el valor COTIZACIÓN
        contenido = "";
        contenido += "<div class='text-center'>";
        contenido += "<h3> Monto en pesos $: " + pesos + "</h3>";
        contenido += "<p> Tasa de cambio: Bs."+ transaccion1.tasaFinal + " </p>";
        contenido += "<p> Banco destino: " + transaccion1.banco + " </p>";
        contenido += "<p> Total a recibir: Bs. " + transaccion1.cotizacion + " </p>";
        contenido += "</div>";
        $("#pasoDos").html(contenido); //Escribo el bloque de contenido en el ID "pasoDos"
    }
}

function confirmar (){
    if ((pesos === false) || (banco == false)){ //Valido que los datos estén completos
        return;
    } else {
        arrayResumen.push(transaccion1); //Guardo la transacción en el array de objetos.
        console.log (arrayResumen);
        $("#totalTransacciones").html(arrayResumen.length);
            total = total + transaccion1.pesos;
        var lista = "";
        var i=1;
        for (let elemento of arrayResumen){
            lista += "<ul class='list-group mb-3' style='display: none'>"
            lista += "<li class='list-group-item d-flex justify-content-between lh-sm resumen'>";
            lista += "<div class='listado'>";
            lista += "<h6 class='my-0'>Transaccion #" + i + "  </h6>";
            lista += "<br>"
            lista += "<p class='text-muted detalles' style='display: none'>" + elemento.banco + " | Tasa: " + elemento.tasaFinal.toFixed(4) + " | Total Bs.: " + elemento.cotizacion +  "</p>";
            lista += "</div>";
            lista += "<span class='text-muted textoSecundario'>" + elemento.pesos + "</span>";
            lista += "</li>";
            i++;
        }
            lista += "<li class='list-group-item d-flex justify-content-between'>";
            lista += "<span class='textoSecundario'>Total (AR$)</span>"
            lista += "<strong class='textoSecundario'>" + total + "</strong>";
            lista += "</li>"
            lista += "</ul>";
        $("#lista").html(lista);
        $("#formCalculadora")[0].reset(); //Hago reset del formulario
        $("#botonModal").html("Agregar Transacción ") //Cambio texto de botón de Calcular.

        const guardarSesion = (clave,valor) => {sessionStorage.setItem(clave,valor)};
        guardarSesion ("listaGlobal", JSON.stringify(arrayResumen));
    }       

}

function procesar(){ //Recupere los datos de las transacciones registradas y envío el resumen de las transacciones por whatsapp.
    const almacenados = JSON.parse(sessionStorage.getItem("listaGlobal"));
    totalAlmacenados = almacenados.length;
    if (totalAlmacenados == 0){
        var enviar = $("#botonProcesar");
        enviar.setAttribute("href","#");
    } else {
        let texto = ""
        let j=1;
        var nombre = $("#tuNombre").val();
        for (let almacenado of almacenados){ //Recorro el array de la storage para enviar cada transacción por whatsapp
            texto += "T" + j + ":" + almacenado.banco + "-" + almacenado.pesos + "$ //";
            j++;
        }
     enviar = document.getElementById("botonProcesar");
     enviar.setAttribute("href","https://api.whatsapp.com/send?phone=5491123871203&text="+ "Hola! soy "+ nombre + " y quiero realizar esta(s) transacción(es): " + texto)
    }
}

/* Ejecución */

$(document).ready(function(){
    $("#inicioModal").modal('toggle');
    $.ajax({ //Traigo los datos de las tasas de cambio desde el JSON al iniciar el doc. 
        method: "GET",
        url: "js/datos.json",
        success: function (data){
            tasa = data.tasas[0].tasa;
            tasaEspecial = data.tasas[0].tasaEspecial;
            let tasaImpresa = "Tasa EPA Bs.  " + tasa + " -- Tasa Especial: Bs. "+ tasaEspecial + " " 
            $("#textoTasa").html(tasaImpresa);
        },
        error: function (data){
            console.log ("datos no leidos")
        }
    })    
})

$("#botonModal").click(function(){
    calcular();
})

$("#botonConfirm").click(function(){
    confirmar();
    $("ul").slideDown(300);
    $(".detalles").toggle(300).css({"width":"100%", "font-size":"0.7rem","font-weight":"500"})
    $(".detalles:last").animate({fontWeight: '700', fontSize:'0.8rem'}).delay(200).animate({fontWeight: '500', fontSize:'0.7rem'});
})

$("#botonProcesar").click(function(){
    procesar();
})

