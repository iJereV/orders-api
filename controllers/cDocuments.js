import mOrder from '../models/mOrder.js';
import { jsPDF } from 'jspdf';
import {utils,write} from 'xlsx';

function truncarTexto(cad,N,points = true){
    return cad.length > N ? cad.slice(0, N - 3) + (points?"…":"") : cad;
}

const cDocuments = {
    generateLoadSheet: async (req, res) =>{
        const { orderIds } = req.body;
        
        if (!Array.isArray(orderIds) || orderIds.length === 0) {
            return res.status(400).json({ text: "Arreglo de ids de pedidos inválido." });
        }

        const pedidos = await mOrder.getMany(orderIds);

        function esPapel(a){
            if( a.indexOf("HIG")!=-1 || a.indexOf("COCINA")!=-1 || a.indexOf("BOBINA")!=-1 ){
                return true;
            };
        }
        
        var lastCargaId;
        var productos=[];
        var listaClientes=[];
        var itinerarios = [];
       
        for(let i=0;i<pedidos.length;i++){  

            if((itinerarios.lastIndexOf(pedidos[i].itinerario) === -1) || itinerarios.length === 0){itinerarios.push(pedidos[i].itinerario)};
            listaClientes.push(pedidos[i].cliente);
            
            let array = pedidos[i].productos;
            for(let j=0;j<array.length;j++){
                let index=productos.findIndex(function esIgual(elemento){return elemento.item == array[j].item});
                if(index!=-1){
                    if(productos[index].item.indexOf("CABO")!=-1){
                        productos.push({"item": array[j].item,"cantidad":parseInt(array[j].cantidad)});
                    }
                    else{
                        productos[index].cantidad+=parseInt(array[j].cantidad);
                    }
                }
                else{
                    productos.push({"item": array[j].item,"cantidad":parseInt(array[j].cantidad)});
                }
            }  
        }

        const papeles = productos.filter(elemento => esPapel(elemento.item.toString()));
        const reciclado = productos.filter(elemento => elemento.item.indexOf("RECICLADO")!=-1);
        const otros = productos.filter(elemento => (!esPapel(elemento.item.toString()) && elemento.item.indexOf("RECICLADO")==-1));

        const otrosSize = otros.length;
        const papelSize = otrosSize + papeles.length;
        productos = otros.concat(papeles).concat(reciclado);

        console.log(productos);

        const doc = new jsPDF();

        let k=0;
        let nroHoja=1;
        while(k<productos.length){
            
            if(nroHoja>1){doc.addPage("a4","portrait");}
            
            //Cabecera
            doc.setFontSize(16);
            doc.rect(10,10,190,35);
            
            doc.text("HOJA DE CARGA",15,20);
            const timeElapsed = Date.now();
            const today = new Date(timeElapsed);
            doc.text(`${today.getDate()}/${today.getMonth()+1}/${today.getFullYear()}`,15,30);
            
            let f=0;
            if(itinerarios>1){
                itinerarios.forEach((v1,v2,s)=>{
                    doc.setFontSize(10);
                    doc.text(v1.toString(),(15+parseInt(f/3)*18),(35+(f%3)*4));
                    f++;
                });
            }else{
                doc.text(itinerarios[0].toString(),15,40);
            }

            doc.setFontSize(8);
            if(listaClientes.length<11){
                for(let i=0;i<listaClientes.length;i++){
                    doc.text(truncarTexto(listaClientes[i].toString(),18),105,(i*3)+13,null,null,"center");
                }
            }else{
                for(let i=0;i<listaClientes.length;i++){
                    doc.text(truncarTexto(listaClientes[i].toString(),18),90+(30*parseInt(i/11)),((i%11)*3)+13,null,null,"center");
                }
            }

            //Tabla
            doc.rect(10,48,190,240);
            doc.line(105,48,105,288);
            doc.setFontSize(11);
            doc.text(`#${parseInt(lastCargaId)+1} - Hoja ${nroHoja}`,10,293);
            let c1=0,c2=0;
            while(k<productos.length  && c2<=39){

                if((k==papelSize || k==otrosSize) && c2>0 && c2<39){
                    doc.line(10,54+(c2*6),105,54+(c2*6));
                    c2++;
                }

                doc.text(productos[k].cantidad.toString(),102,52+(c2*6),null,null,'right');
                if(productos[k].item.length>35){
                    doc.text(productos[k].item.substr(0,32),13,52+(c2*6));
                    c2++;
                    doc.text(productos[k].item.substr(32,productos[k].item.length-32),13,52+(c2*6));
                }else{
                    doc.text(productos[k].item,13,52+(c2*6)); 
                } 
                
                doc.line(10,54+(c2*6),105,54+(c2*6));
                c2++;
                
                k++;
            }
            while(k<productos.length  && c1<=39){

                if((k==papelSize || k==otrosSize) && c1>0 && c1<39){
                    doc.line(105,54+(c1*6),200,54+(c1*6));
                    c1++;
                }

                doc.text(productos[k].cantidad.toString(),197,52+(c1*6),null,null,'right');
                if(productos[k].item.length>35){
                    doc.text(productos[k].item.substr(0,32),108,52+(c1*6));
                    c1++;
                    doc.text(productos[k].item.substr(32,productos[k].item.length-32),108,52+(c1*6));
                }else{
                    doc.text(productos[k].item,108,52+(c1*6)); 
                }
                
                doc.line(105,54+(c1*6),200,54+(c1*6));
                c1++;
                k++;
            }
                nroHoja++;
        }

        const timeElapsed = Date.now();
        const today = new Date(timeElapsed);
        const fechaString = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;
        const pdfBase64 = doc.output('datauristring').replace('filename=generated.pdf;', '');
        const base64SinEncabezado = pdfBase64.replace(/^data:application\/pdf;base64,/, '');
        const pdfBuffer = Buffer.from(base64SinEncabezado, 'base64');

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename="hoja-carga.pdf"');
        res.send(pdfBuffer);

        // doc.save(`CARGA ${JSON.stringify(itinerarios)}_${fechaString}`);
    },
    generateReceipts: async (req, res) => {
        const { orderIds } = req.body;
        
        if (!Array.isArray(orderIds) || orderIds.length === 0) {
            return res.status(400).json({ text: "Arreglo de ids de pedidos inválido" });
        }

        const pedidos = await mOrder.getMany(orderIds);

        console.log(pedidos);

        function nuevaHoja(doc,pedido,nroHoja){

            ////////////Forma general del remito////////////
            var LEFT_BORDER_X = 5,
                RIGHT_BORDER_X = 143,
                PAGESIZE_X = RIGHT_BORDER_X - LEFT_BORDER_X,
                TOP_BORDER_Y = 5,
                BOTTOM_BORDER_Y = 205,
                PAGESIZE_Y = BOTTOM_BORDER_Y - TOP_BORDER_Y;

            let nroRemito = pedido.id.toString(); 
            let stringFecha = pedido.fecha;
            let DMA = stringFecha.split("/");

            doc.rect(LEFT_BORDER_X,TOP_BORDER_Y,PAGESIZE_X,PAGESIZE_Y); 
            doc.rect(154,5,PAGESIZE_X,PAGESIZE_Y);

            for(let i=0;i<18;i++){doc.line(148.5,i*12,148.5,i*12+5,'S');}

            ///////////////////Original///////////////////

            //Vendedor
            doc.setFontSize('9')

            if(pedido.vendedor == "AGUSTIN"){ doc.text('A',142,8,null,null,'right');}
                else if(pedido.vendedor == "FRANCO"){doc.text('F',142,8,null,null,'right')}
                else if(pedido.itinerario == "ANDREK"){doc.text('D',142,8,null,null,'right')}

            //Cabecera
            doc.setFontSize('20')
            doc.text('PRESUPUESTO',10,18);

            doc.setFontSize('7.2');
            doc.text('DOCUMENTO NO VÁLIDO COMO FACTURA',10,23);

            doc.setFontSize('38');
            doc.text('X',74,23);

            // while(nroRemito.length<10){nroRemito=`0${nroRemito}`;}
            // doc.setFontSize(12);
            // doc.text(nroRemito,60.5,196,null,null,'center');
            doc.setFontSize(10);
            doc.text(`HOJA ${nroHoja}`,49,200,null,null,'left');

            //Fecha
            doc.rect(96,12,42,12);
            //doc.rect(96,14,42,5);
            doc.line(110,12,110,24);
            doc.line(124,12,124,24);
            doc.setFontSize(10);
            doc.text("DÍA",103,16,null,null,'center');
            doc.text("MES",117,16,null,null,'center');
            doc.text("AÑO",131,16,null,null,'center');

            doc.setFontSize(12);
            doc.text(DMA[0],103,21.5,null,null,"center");
            doc.text(DMA[1],117,21.5,null,null,"center");
            doc.text(DMA[2],131,21.5,null,null,"center");

            //Informacion cliente
            doc.setFontSize(12);
            //doc.rect(10,32,128,22)
            doc.text(`Señor/es: ${pedido.cliente}`,10,32);
            doc.text(`Dirección: ${pedido.direccion||""}`,10,39);
            doc.text(`Localidad: ${pedido.localidad||""}`,10,46);

            //Tabla
            //doc.rect(10,51,128,138);
            doc.setFontSize(9);

            doc.line(21,51,21,189);
            doc.text('CANT.',15,55,null,null,'center');

            doc.line(115,51,115,189);
            doc.text('IMPORTE',126,55,null,null,'center');

            doc.line(97,51,97,189);
            doc.text('P. UNIT.',105.5,55,null,null,'center');
            doc.text('DESCRIPCIÓN',60,55,null,null,'center');

            for(let i = 0;i<24;i++){
                doc.line(10,51+(i*6),138,51+(i*6))
            }

            //Total
            doc.rect(102,192.5,36,8);
            doc.text('EMAU S.R.L.',10,193.5);
            doc.text("CEL:(3496) 444080",10,197);
            doc.text("quimicaemau@gmail.com",10,200.5);

            doc.setFontSize(10);
            doc.text('TOTAL:',110,198,null,null,'center');

            //Bidones vacíos
            doc.setFontSize(8);
            doc.text('DEVOL. BIDONES',87,192,null,null,'center');
            doc.rect(74,192.5,26,8);
            doc.rect(82.667,192.5,8.667,8);

            doc.text('x5',81,200,null,null,'center'); 
            doc.text('x10',89,200,null,null,'center'); 
            doc.text('x20',97.7,200,null,null,'center');   

            ///////////////////Duplicado/////////////////////////

            doc.setFontSize('9')
            //Vendedor
            
                if(pedido.vendedor == "AGUSTIN"){ doc.text('A',291,8,null,null,'right');}
                else if(pedido.vendedor == "FRANCO"){doc.text('F',291,8,null,null,'right')}
                else if(pedido.itinerario == "ANDREK"){doc.text('D',291,8,null,null,'right')}
            

            //Cabecera
            doc.setFontSize('20')
            doc.text('PRESUPUESTO',158.5,18);

            doc.setFontSize('7.2');
            doc.text('DOCUMENTO NO VÁLIDO COMO FACTURA',158.5,23);

            doc.setFontSize('38');
            doc.text('X',222.5,23);

            // while(nroRemito.length<10){nroRemito=`0${nroRemito}`;}
            // doc.setFontSize(12);
            // doc.text(nroRemito,217.5,196,null,null,'center');
            doc.setFontSize(10);
            doc.text(`HOJA ${nroHoja}`,217.5,200,null,null,'center');

            //Fecha
            doc.rect(244.5,12,42,12);
            //doc.rect(96,14,42,5);
            doc.line(258.5,12,258.5,24);
            doc.line(272.5,12,272.5,24);
            doc.setFontSize(10);
            doc.text("DÍA",251.5,16,null,null,'center');
            doc.text("MES",265.5,16,null,null,'center');
            doc.text("AÑO",279.5,16,null,null,'center');

            doc.setFontSize(12);
            doc.text(DMA[0],251.5,21.5,null,null,"center");
            doc.text(DMA[1],265.5,21.5,null,null,"center");
            doc.text(DMA[2],279.5,21.5,null,null,"center");

            //Informacion cliente
            doc.setFontSize(12);
            //doc.rect(10,32,128,22)
            doc.text(`Señor/es: ${pedido.cliente}`,158.5,32);
            doc.text(`Dirección: ${pedido.direccion||""}`,158.5,39);
            doc.text(`Localidad: ${pedido.localidad||""}`,158.5,46);

            //Tabla
            //doc.rect(10,51,128,138);
            doc.setFontSize(9);

            doc.line(169.5,51,169.5,189);
            doc.text('CANT.',163.5,55,null,null,'center');

            doc.line(263.5,51,263.5,189);
            doc.text('IMPORTE',274.5,55,null,null,'center');

            doc.line(245.5,51,245.5,189);
            doc.text('P. UNIT.',254,55,null,null,'center');
            doc.text('DESCRIPCIÓN',208.5,55,null,null,'center');

            for(let i = 0;i<24;i++){
                doc.line(158.5,51+(i*6),286.5,51+(i*6))
            }

            //Total
            doc.rect(243.5,192,43,8);
            doc.text('EMAU S.R.L.',158.5,193.5);
            doc.text("CEL:(3496) 444080",158.5,197);
            doc.text("quimicaemau@gmail.com",158.5,200.5);

            doc.setFontSize(10);
            doc.text('TOTAL:',251.2,197.5,null,null,'center');
        }

        var doc = new jsPDF({orientation:'landscape'});
        var band=false;
        var total;
        var descuento;
        var hojaCounter=1;

        var arrayProductos;

        var itinerarios = [];
        var descString = '';
        
        var name,precio,variacion,cantidad,subtotal;

        pedidos.forEach((pedido,i) => {
            let nroHoja = 1;
            if(itinerarios.lastIndexOf(pedido.itinerario) === -1){itinerarios.push(pedido.itinerario)};
            
            //Inicializacion
            total = 0;
            descuento = 0;
            band = false;
            arrayProductos=pedido.productos;
            if(i>=1){
                doc.addPage("a4","landscape");
                doc.setPage(hojaCounter+1);
                hojaCounter++;
            }
            nuevaHoja(doc,pedido,nroHoja);
            
            var renglon=1;

            for(let i=0;i<arrayProductos.length;i++){

                //Nueva página
                if(band&&renglon>21){
                    
                    renglon=1;
                    //Total
                    doc.text(total.toFixed(2).toString(),137,197.5,null,null,'right');
                    doc.text(total.toFixed(2).toString(),285.5,197.5,null,null,'right');
                    total=0;

                    doc.setFontSize(10);
                    doc.text(`(+)`,227,200,null,null,'center');
                    doc.text(`(+)`,78.5,200,null,null,'center');
                    doc.setFontSize(12);
                    
                    doc.addPage("a4","landscape");
                    doc.setPage(hojaCounter+1);
                    hojaCounter++;
                    nroHoja++;
                    nuevaHoja(doc,pedido,nroHoja,1);
                    remitoCounter++;
                }else{band=true}


                ////////Impresion de linea////////
                name=arrayProductos[i].item;
                precio=parseFloat(arrayProductos[i].precio);
                cantidad=parseInt(arrayProductos[i].cantidad);
                variacion= parseFloat(arrayProductos[i].variacion);

                if(variacion!=0 && !isNaN(variacion)){
                    subtotal = precio + (precio * variacion / 100);
                    subtotal = cantidad*subtotal;

                    if(variacion<0 && variacion!=(-100)){
                        descString = `(${variacion}%)`;
                    }
                }else{
                    subtotal = cantidad*precio;
                    descString = '';
                }

                total+=subtotal;
                let cad = descString+name;
                
                //Original
                doc.text(cantidad.toString(),15,55.5+((renglon)*6),null,null,'center');

                //Duplicado
                doc.text(cantidad.toString(),163.5,55.5+((renglon)*6),null,null,'center');
                
                
                if(cad.length>38){
                    
                    //ORIGINAL
                    doc.text(truncarTexto(cad,34,false),23,55.5+((renglon)*6));
                    
                    
                    doc.setDrawColor("FFFFFF");
                    doc.setFillColor("FFFFFF");
                    doc.rect(9,50+((renglon+1)*6),130,2,'F')//orig
                    doc.setDrawColor('000000')

                    doc.line(21,51,21,189);
                    doc.line(115,51,115,189);
                    doc.line(97,51,97,189);
                    
                    //DUPLICADO
                    doc.text(truncarTexto(cad,34,false),171.5,55.5+((renglon)*6));//duplicado
                    

                    doc.setDrawColor("FFFFFF");
                    doc.setFillColor("FFFFFF");
                    doc.rect(158.5,50+((renglon+1)*6),130,2,'F')//duplicado
                    doc.setDrawColor('000000')
                
                    doc.line(169.5,51,169.5,189);
                    doc.line(263.5,51,263.5,189);
                    doc.line(245.5,51,245.5,189);

                    renglon++
                    doc.text(truncarTexto(cad.substring(31),35,true),23,55.5+((renglon)*6));//orig

                    doc.text(truncarTexto(cad.substring(31),35,true),171.5,55.5+((renglon)*6));//duplicado
                    
                }else{
                    doc.text(truncarTexto(cad,35),23,55.5+((renglon)*6));//orig
                    doc.text(truncarTexto(cad,35),171.5,55.5+((renglon)*6));//duplicado
                }

                //Original
                doc.text(precio.toFixed(2).toString(),114,55.5+((renglon)*6),null,null,'right');
                doc.text(subtotal.toFixed(2).toString(),137,55.5+((renglon)*6),null,null,'right');

                //Duplicado
                doc.text(precio.toFixed(2).toString(),262.5,55.5+((renglon)*6),null,null,'right');
                doc.text(subtotal.toFixed(2).toString(),285.5,55.5+((renglon)*6),null,null,'right');
                renglon++;
            }
            //Total
            doc.text(total.toFixed(2).toString(),137,198,null,null,'right');
            doc.text(total.toFixed(2).toString(),285.5,197.5,null,null,'right');
            total=0;
            doc.setFontSize(12);
        });
   
        doc.autoPrint({variant: 'javascript'});
        const pdfBase64 = doc.output('datauristring').replace('filename=generated.pdf;', '');
        const base64SinEncabezado = pdfBase64.replace(/^data:application\/pdf;base64,/, '');
        const pdfBuffer = Buffer.from(base64SinEncabezado, 'base64');

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename="hoja-carga.pdf"');
        res.send(pdfBuffer);

    },
    generateOrdersSummary: async(req, res) =>{
        const { orderIds } = req.body;

         if (!Array.isArray(orderIds) || orderIds.length === 0) {
            return res.status(400).json({ text: "Arreglo de ids de pedidos inválido" });
        }

        const pedidos = await mOrder.getMany(orderIds);

        function calcularTotales(pedidos) {
            return pedidos.map(pedido => {
                const total = pedido.productos.reduce((acumulado, producto) => {
                const precioConVariacion = producto.precio * (1 + (producto.variacion / 100));
                const totalProducto = producto.cantidad * precioConVariacion;
                return acumulado + totalProducto;
                }, 0);
            
                return {
                    id: pedido.id,
                    cliente: pedido.cliente,
                    fecha: pedido.fecha,
                    total: total
                };
            });
        }

        const pedidosConTotales = calcularTotales(pedidos); 
        
        let T=0,data=[];

        pedidosConTotales.forEach(pedido => {
            data.push([pedido.id,pedido.cliente,pedido.fecha,pedido.total.toFixed(2)])
            T+=parseFloat(pedido.total)
        });
        
        const encabezado = ['ID Pedido', 'Cliente', 'Fecha', 'Total'];
        
        let matrix = [encabezado, ...data,['','','TOTAL:',T]];
        
        var wb = utils.book_new();
        wb.Props = {
            Title: "Resumen Pedidos",
            Author: "EMAU SRL",
        };
        wb.SheetNames.push("Hoja 1");

        var ws = utils.aoa_to_sheet(matrix);
        wb.Sheets["Hoja 1"] = ws;
        
        var buffer = write(wb, {bookType: 'xlsx', type: 'buffer'});
        res.setHeader('Content-Disposition', 'attachment; filename="ResumenPedidos.xlsx"');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buffer);
    },
    generateProductsSummary: async(req, res) => {

        const { orderIds } = req.body;

        if (!Array.isArray(orderIds) || orderIds.length === 0) {
            return res.status(400).json({ text: "Arreglo de ids de pedidos inválido" });
        }

        const pedidos = await mOrder.getMany(orderIds);
        let productos = []

        for(let i=0;i<pedidos.length;i++){
            let array = pedidos[i].productos;
            for(let j=0;j<array.length;j++){
                let index=productos.findIndex(function esIgual(elemento){return (elemento.item == array[j].item) && (elemento.precio == array[j].precio) && (elemento.variacion == array[j].variacion)});
                if(index!=-1){
                    productos[index].cantidad+=parseInt(array[j].cantidad);   
                }
                else{
                    productos.push({"item": array[j].item,"cantidad":parseInt(array[j].cantidad),"precio":parseFloat(array[j].precio),"variacion":parseFloat(array[j].variacion)});
                }
            }
        }

        productos.sort((a,b) => a.item.localeCompare(b.item)); 
        
        let arrayName = Array.from(productos);
        arrayName = arrayName.sort();

        var wb = utils.book_new();
        wb.Props = {
            Title: "Resumen Ventas",
            Author: "EMAU SRL",
        };
        wb.SheetNames.push("Hoja 1");
        
        let matrix,T=0,e=0;
        matrix = arrayName.map( x => {
            const precioConVariacion = x.precio * (1 + (x.variacion / 100));
            e=precioConVariacion*parseInt(x.cantidad)
            T+=e;
            return [x.item,precioConVariacion.toString(),x.cantidad.toString(),e.toString()]
        })

        matrix.push(['','','TOTAL:',T])
        console.log(`TOTAL: ${T}`)
        
        var ws_data = matrix;
        var ws = utils.aoa_to_sheet(ws_data);
        wb.Sheets["Hoja 1"] = ws;

        var buffer = write(wb, {bookType: 'xlsx', type: 'buffer'});
        res.setHeader('Content-Disposition', 'attachment; filename="ResumenProductos.xlsx"');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buffer);
    }
};

export default cDocuments;

