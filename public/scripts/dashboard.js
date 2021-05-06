// var data = {
//     "translateThis": ["about", "signuptitle", "back", "time", "blood_glucose_chart"]
// };

var time = "Time";

function translate(translatedPhrases){
    var phrases = JSON.parse(translatedPhrases);
    time = phrases[2];
};


// async function getTranslations() {
//     const response = await fetch("/translations", {
//         method: "POST",
//         headers: {
//             'Accept': 'application/json',
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify(data)
//     });

//     const translatedPhrases = await response.json();

//     console.log(translatedPhrases[0]);
//     time = translatedPhrases[3];
//     title = translatedPhrases[4];
    
// };


// getTranslations();

function graph(data, translatedPhrases) {

    document.addEventListener('DOMContentLoaded', function () {

        jsonObject = JSON.parse(data);

        var date = new Date();
        dateFormat = date.getFullYear() + "-" + ('0' + (date.getMonth() + 1)).slice(-2) + "-" + ('0' + date.getDate()).slice(-2);

        var dateControl = document.getElementById('dateCalendar');

        var ctx = document.getElementById("myChart").getContext("2d");

        var historylist = document.getElementById("history-list");

        var phrases = JSON.parse(translatedPhrases);
        var high_value = phrases[0];
        var low_value = phrases[1];
        var title = phrases[3];
        var glucose = phrases[4];

        
        dateControl.value = dateFormat;

        if (jsonObject.dates[0] != undefined){

            dateControl.setAttribute('min', jsonObject.dates[0].date)
        }
        dateControl.setAttribute('max', dateFormat);


        var index = -1
        for (i in jsonObject['dates']) {

            if (jsonObject['dates'][i]['date'] == dateFormat) {
                index = i;

            }

           

        };

        var jsonGlucose = [];
        var timestamps = [];
        var carbs = [];

        if (index != -1) {

            var jsonGluLength = jsonObject['dates'][index]['glucosedata'].length;
        
            for (i = 0; i < jsonGluLength; i++) {
                jsonGlucose.push(parseFloat(jsonObject['dates'][index]['glucosedata'][i]['glucoselevels']));
                timestamps.push(jsonObject['dates'][index]['glucosedata'][i]['timestamps']);
                carbs.push(parseFloat(jsonObject['dates'][index]['glucosedata'][i]['carbs']));
            }

            
            var html = '';

        
            jsonObject['dates'][index]['glucosedata'].map(match => {
    
            html +=
                `
                <div class="box">
                    <h4>Glucose Level: ${match.glucoselevels}  <p style="text-align: center;" >Carbs ${match.carbs}</p>  </h4> 
                    <h>${match.timestamps} </h>
        
                </div>

                `
    
            }).join('');
        

            historylist.innerHTML = html


        }

        if (jsonObject['diabetic'] == true) {
            var topAnnotation = 180;
            var sugMax = 200;
            var topAnnotationText = high_value;
            var btmAnnotationText = low_value;

        }
        else {
            var topAnnotation = 140;
            var sugMax = 160;
            var topAnnotationText = high_value;
            var btmAnnotationText = low_value;
        }

    
        

        var myChart = new Chart(ctx, {

            // The type of chart we want to create
            type: "line",
            // The data for our dataset
            data: {
                labels: timestamps,
                datasets: [
                    {
                        label: glucose + " mg/dL",
                        fill: false,
                        borderColor: "rgb(255, 99, 132)",
                        data: jsonGlucose,
                    },
                    {
                        label: "Carbs",
                        fill: false,
                        borderColor: "rgb(0, 191, 255)",
                        data: carbs,

                    },
                ],
            },
            // Configuration options go here
            options: {

                title: {
                    display: true,
                    text: title
                },
                scales: {
                    yAxes: [{
                        ticks: {
                            suggestedMin: 20,
                            suggestedMax: sugMax
                        }
                    }]
                },
                annotation: {
                    annotations: [
                        {
                            id: 'btmLine',
                            type: 'line',
                            mode: 'horizontal',
                            scaleID: 'y-axis-0',
                            value: 50,
                            borderColor: 'red',
                            borderWidth: 2,
                            borderDash: [4, 8],
                            label: {
                                backgroundColor: "red",
                                content: btmAnnotationText,
                                enabled: true
                            }
                        }, {
                            id: 'topLine',
                            type: 'line',
                            mode: 'horizontal',
                            scaleID: 'y-axis-0',
                            value: topAnnotation,
                            borderColor: 'red',
                            borderWidth: 2,
                            borderDash: [4, 8],
                            label: {
                                backgroundColor: "red",
                                content: topAnnotationText,
                                enabled: true
                            }
                        }
                    ]
                }
            },
        });

        
        dateControl.addEventListener("change", function() {
            
            historylist.innerHTML = '';
            dateFormat = dateControl.value.toString();
            dateFormat = dateFormat.split(/-/);
            dateFormat = dateFormat[0] + "-" + ('0' + parseInt(dateFormat[1]).toString()).slice(-2) + "-" + ('0' +  dateFormat[2].toString()).slice(-2); // remove leading zero from month
            
            
            var updatedIndex = -1;
            for (j in jsonObject['dates']) {
                if (jsonObject['dates'][j]['date'] == dateFormat) {
                    updatedIndex = j;
                }
            };

            
            jsonGlucose.length = 0;
            timestamps.length = 0;
            carbs.length = 0;

            if (updatedIndex == -1){
                myChart.data.labels = timestamps;
                myChart.data.datasets[0].data = jsonGlucose;
                myChart.data.datasets[1].data = carbs;
            }
            else {
                jsonGluLength = jsonObject['dates'][updatedIndex]['glucosedata'].length;

                for (i = 0; i < jsonGluLength; i++) {
                    jsonGlucose.push(parseFloat(jsonObject['dates'][updatedIndex]['glucosedata'][i]['glucoselevels']));
                    timestamps.push(jsonObject['dates'][updatedIndex]['glucosedata'][i]['timestamps']);
                    carbs.push(parseFloat(jsonObject['dates'][updatedIndex]['glucosedata'][i]['carbs']));
                }
    
                myChart.data.labels = timestamps;
                myChart.data.datasets[0].data = jsonGlucose;
                myChart.data.datasets[1].data = carbs;

                
                

                var html = '';

    
                jsonObject['dates'][updatedIndex]['glucosedata'].map(match => {
    
                    html +=
                        `
                        <div class="box">
                            <h4>Glucose Level: ${match.glucoselevels}  <p style="text-align: center;" >Carbs ${match.carbs}</p>  </h4> 
                            <h>${match.timestamps} </h>
        
                        </div>

                        `
    
                }).join('');
        

                historylist.innerHTML = html
                

            }

            myChart.update();
        })

    });
}





function clock() {
    var today = new Date();
    var hours = today.getHours()
    var minutes = today.getMinutes();
    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours != 0 ? hours : 12;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    timestamp = time + ': ' + hours.toString() + ':' + minutes.toString() + ' ' + ampm;


    document.getElementById('txt').innerHTML = timestamp;
    var t = setTimeout(clock, 500);

}


function notifications(data, firsttime, translatedPhrases) {
    

    if (firsttime == "true") {

        var phrases = JSON.parse(translatedPhrases);

        var notifTitle = phrases[64];

        
        jsonObject = JSON.parse(data);

        //TODO Add index for date value
        //TODO Currently just testing
        var index = -1
        for (i in jsonObject['dates']) {
            if (!jsonObject['dates'][i]['glucosedata'].length == 0){
                index = i;
            }
        }


        if (index == -1){
            return;
        }

        var jsonGluLength = jsonObject['dates'][index]['glucosedata'].length;
        var jsonGlucose = [];

        for (i = 0; i < jsonGluLength; i++) {
            jsonGlucose.push(parseFloat(jsonObject['dates'][index]['glucosedata'][i]['glucoselevels']));
        }

        const diabetic = jsonObject['diabetic'];
        const glucoselevel = jsonGlucose.slice(-1)[0];


        

        var low = [];
        var normal = [];
        var high = [];

        phrases.forEach((phrase,phraseindex) => {

            if (phraseindex >= 5 && phraseindex <= 24){
                low.push(phrase);
            }
            else if (phraseindex >= 25 && phraseindex <= 43){
                normal.push(phrase);
            }
            else if (phraseindex >= 44 && phraseindex <= 63){
                high.push(phrase);
            }

            
        });


        console.log(low);
        console.log(normal);
        console.log(high);
        
        

        if (glucoselevel != undefined){

            
    
            document.addEventListener('DOMContentLoaded', function () {

                

                const notification = document.getElementById('notification');

                var divclass = "notification is-danger is-light";

                var message = "<u>" + notifTitle + ":</u> <br>";


                if (diabetic === true) {

                    //high
                    if (glucoselevel >= 200) {
                        notification.innerHTML =
                            `
                                <div class="${divclass}">
                                    <button class="delete"></button>
                                    ${message}
                                    ${high[Math.floor(Math.random() * high.length)]}   
                                                
                                </div>

                            `
                    }

                    //normal
                    else if (glucoselevel >= 127) {
                        notification.innerHTML =
                            `
                                <div class="${divclass}">
                                    <button class="delete"></button>
                                    ${message}
                                    ${normal[Math.floor(Math.random() * normal.length)]}   
                                                
                                </div>

                            `
                    }

                    //low
                    else if (glucoselevel <= 126) {
                        notification.innerHTML =
                            `
                                <div class="${divclass}">
                                    <button class="delete"></button>
                                    ${message}
                                    ${low[Math.floor(Math.random() * low.length)]}   
                                                
                                </div>

                            `
                    }
                }

                else if (diabetic === false) {
                    //high
                    if (glucoselevel >= 140) {
                        notification.innerHTML =
                            `
                                <div class="${divclass}">
                                    <button class="delete"></button>
                                    ${message}
                                    ${high[Math.floor(Math.random() * high.length)]}   
                                                
                                </div>

                            `
                    }

                    //normal
                    else if (glucoselevel >= 81) {
                        notification.innerHTML =
                            `
                                <div class="${divclass}">
                                    <button class="delete"></button>
                                    ${message}
                                    ${normal[Math.floor(Math.random() * normal.length)]}   
                                                
                                </div>

                            `
                    }

                    //low
                    else if (glucoselevel <= 80) {
                        notification.innerHTML =
                            `
                                <div class="${divclass}">
                                    <button class="delete"></button>
                                    ${message}
                                    ${low[Math.floor(Math.random() * low.length)]}   
                                                
                                </div>

                            `
                    }
                }

                var closebtns = notification.getElementsByClassName('delete');

                for (i of closebtns) {
                    i.addEventListener("click", function () {
                        this.parentNode.remove();
                    });
                }

            })


        }

    }
};


