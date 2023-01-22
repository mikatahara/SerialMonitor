var STPORT=0;
var STOPEN=STPORT+1;	//Port is opened
var STREAD=STOPEN+1;	//Read
var STPAUSE=STREAD+1;	//Read is pauseing	
var STCLOSE=STPAUSE+1;	//Port is closed
var mStatus=STPORT;


var baudtable=[1200,2400,4800,9600,19200,38400,57600,74880,115200,230400];

navigator.serial.addEventListener('connect', (e) => {
  // `e.target` に接続する、すなわち利用可能なポートのリストに加えます。
	console.log("connect");
	console.log(e.target);
});

navigator.serial.addEventListener('disconnect', (e) => {
  // `e.target` を利用可能なポートのリストから外します。
	console.log("disconnect");
	console.log(e.target);
});

navigator.serial.getPorts().then((ports) => {
  // ページの読み込み時、`ports` を用いて利用可能なポートのリストを初期化します。
});


var mPort=null;
var mLog=null;
var mKeepReading = true;

window.onload = function() {

	mLog=document.getElementById("log");

	$('#serial_start').click(function() {
		if(mPort!=null){ 
			mLog.innerText+="Serial Port has already connected!\n";	
			return;
		}

		navigator.serial.requestPort().then((port) => {
			console.log("list");
			// `port` に接続する、すなわち利用可能なポートのリストに加えます。
			mPort=port;
			mKeepReading=true;
			portopen(port);		//Port opens and Read starts
		}).catch((e) => {
			console.log("error");	// ユーザーがポートを選択しませんでした。
		});
	});

	$('#restart').click(function(){
		if(mStatus==STPAUSE){
			mKeepReading=true;
			reread(mPort);
		} else if(mStatus==STCLOSE){
			mKeepReading=true;
			portopen(mPort);		//Port opens and Read starts
		}
	});

	$('#write').click(function(){
		writepoart(mPort);
	});

	$('#stop').click(function(){
		mKeepReading=false;

	});

	$('#close').click(function(){
		mKeepReading=false;
		pclose(mPort);
	});

	$('#clear').click(function(){
		mLog.innerText="";
	});

	$('#baud').change(function(){
		mKeepReading=false;
		pclose(mPort);
		mKeepReading=true;
		portopen(mPort);		//Port opens and Read starts
	});
}


async function writepoart(port)
{
	const encoder = new TextEncoder();
	const writer = port.writable.getWriter();

	str= $('#wtxt').val();
	var arr=[];
	for(var i=0; i<str.length; i++){
		arr[i]=str.charCodeAt(i);
	}
	var xint8 = new Uint8Array(arr);

	await writer.write(xint8);
	await writer.releaseLock();		
//	await writer.close();
}

async function portopen(port)
{
	var v=$('#baud').val();
	var br=baudtable[v];
	await port.open({ baudRate:br });
	mStatus=STOPEN;
	reread(port);
}

async function reread(port)
{
	mStatus=STREAD;
	while (port.readable && mKeepReading) {
		const reader = port.readable.getReader();

		while (mKeepReading) {
			const { value, done } = await reader.read();
    	 	if (done) break;
			let char="";
			for(var i=0; i<value.length; i++)
				char+=String.fromCharCode(value[i]);
			mLog.innerText+=char;
 		}
		await reader.releaseLock();
		mStatus=STPAUSE;
		break;
	}
}

async function pclose(port)
{
	var t=setInterval(function() {
	    if(mStatus==STPAUSE){
			mStatus=STCLOSE;
			port.close();
	    }
	}, 100);

}
