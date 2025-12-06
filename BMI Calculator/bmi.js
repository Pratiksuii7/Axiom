function switchunits(unittype){
    const metricdiv = document.getElementById('metricinputs');
    const imperialdiv = document.getElementById('imperialinputs');
    const metricbutton = document.getElementById('metricbutton');
    const imperialbutton = document.getElementById('imperialbutton');

    if (unittype=== 'metric') {
        metricdiv.style.display = 'block';
        imperialdiv.style.display = 'none';
        metricbutton.className = 'unitbutton unitbutton-active';
        imperialbutton.className = 'unitbutton unitbutton-inactive';
    } else{
        metricdiv.style.display = 'none';
        imperialdiv.style.display = 'block';
        metricbutton.className = 'unitbutton unitbutton-inactive';
        imperialbutton.className = 'unitbutton unitbutton-active';
    }
    calculatebmi();
}
//have you watched naruto?
function calculatebmi(){
    const metricdiv = document.getElementById('metricinputs');
    let weightkg = 0;
    let heightm = 0;
    const ismetric = metricdiv.style.display !== 'none';
    //naruto is awesome
    if (ismetric) {
        const heightinputmetric = document.getElementById('heightinputmetric');
        const weightinputmetric = document.getElementById('weightinputmetric');
        //specially kakashi is so much awesome
        const heightcm = parseFloat(heightinputmetric.value);
        const weightkgraw = parseFloat(weightinputmetric.value);
        //and jiraya too
        if (heightcm > 0 && weightkgraw > 0) {
            heightm = heightcm / 100;
            weightkg = weightkgraw;
        }
    } else{
        const heightinputfeet = document.getElementById('heightinputfeet');
        const heightinputinches = document.getElementById('heightinputinches');
        const weightinputimperial = document.getElementById('weightinputimperial');
        // watch naruto ok?
        const heightfeet = parseFloat(heightinputfeet.value);
        const heightinches = parseFloat(heightinputinches.value);
        const weightlbs = parseFloat(weightinputimperial.value);

        if ((heightfeet + heightinches)>0 && weightlbs>0) {
            const totalinches = heightfeet * 12 + heightinches;
            heightm = totalinches * 0.0254;
            weightkg = weightlbs / 2.20462;
        }
    }

    const bmivalueelement = document.getElementById('bmivalue');
    const assessmenttextelement = document.getElementById('assessmenttext');
    const resultboxelement = document.getElementById('resultbox');

    resultboxelement.className = 'resultdisplay status-default';

    if (heightm > 0 && weightkg > 0) {
        const bmiresult = weightkg / (heightm * heightm);
        const bmiformatted = bmiresult.toFixed(2);

        let assessment = '';
        let statusclass = '';

        if (bmiresult < 18.5) {
            assessment = 'Underweight'; //sadly i am underweight
            statusclass = 'status-underweight';
        } else if (bmiresult >= 18.5 && bmiresult < 25) {
            assessment = 'Normal-Weight';
            statusclass = 'status-normal';
        }
         else if (bmiresult >= 25 && bmiresult < 30){
            assessment = 'Overweight';
            statusclass = 'status-overweight';
         } else {
            assessment = 'Obese';
            statusclass = 'status-obese';
         }
         bmivalueelement.textContent = bmiformatted;
         assessmenttextelement.textContent = assessment;
         resultboxelement.className = `resultdisplay ${statusclass}`;
    } else{
        bmivalueelement.textContent = '0.00';
        assessmenttextelement.textContent = 'Enter your detailsabove.';
        resultboxelement.className = 'resultdisplay status-default';

    }
}

document.addEventListener('DOMContentLoaded', () =>{
    switchunits('metric');
    calculatebmi();
});