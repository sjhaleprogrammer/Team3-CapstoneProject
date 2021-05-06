




document.addEventListener('DOMContentLoaded', function () {

  var total = 0;

  const search = document.getElementById('foodinput');
  const matchList = document.getElementById('match-list');
  const dictionary = document.getElementById('dictionary');
  const hidden = document.getElementById('hiddenInput');

  
 

   //calling api
  var myEfficientFn = debounce( async function() {

    url = 'https://api.nal.usda.gov/fdc/v1/foods/search?api_key=niQ8qRk2FqXYhdvQYRbYHKjtLdWWaH8nbJiSysVw&query=' + search.value;
  
    var res = await fetch(url);
  
    var foods = await res.json();

    console.log(foods);

    foodlist = foods.foods.filter(food => { return food });

    outputHTML(foodlist);

  }, 350, false);


  


  function outputHTML(matches) {

    if (matches.length > 0) {

      var html = '';

      matches.map(match => {
        if (match.brandOwner === undefined) {
          html +=
          `
            <div class="box">

              <h1 style = "font-size: 25px;">${match.lowercaseDescription} </h1>
              <p>${match.foodNutrients[2].value} Carbs</p>

            </div>

          `
        }
        else {
          html +=
          `
            <div class="box">

              <h1 style = "font-size: 25px;">${match.lowercaseDescription} - ${match.brandOwner} </h1>
              <p>${match.foodNutrients[2].value} Carbs</p>

            </div>

          `

        }



      }).join('');


      matchList.innerHTML = html

      list();




    }


  };


  function list() {


    //get the divs inside of the search
    var divs = matchList.getElementsByTagName('div');

    for (i of divs) {

      i.addEventListener("mouseover", function( event ) {
        // highlight the mouseover target
        this.style.background = "rgb(255,99,132)";
      
      });

      i.addEventListener("mouseout", function( event ) {
        // highlight the mouseover target
        this.style.background = "";
      });

      i.addEventListener('click', function (event) {

        var food = this.getElementsByTagName('h1')[0].innerHTML;
        var carbs = this.getElementsByTagName('p')[0].innerHTML;

        carbs = parseFloat(carbs.match(/[\d\.]+/))

        total += carbs;

        console.log(total);

        matchList.style = '';
        matchList.innerHTML = '';
        search.value = '';

        dictionary.innerHTML += `
                                  <div class="control">
                                    <div class="tags has-addons" name="${carbs}"> 
                                      <a class="tag is-danger">${food} - ${carbs}g</a>
                                      <a class="tag is-delete"> </a> 
                                    </div>
                                  </div>

                                `


        var closebtns = dictionary.getElementsByClassName('tag is-delete');

        for (i of closebtns) {
          i.addEventListener("click", function () {

            total = (total * 10 - parseFloat(this.parentNode.getAttribute("name")) * 10) / 10;


            this.parentNode.remove();

            console.log(total)
            
          });
        }

        hidden.value = total.toString();

      });

    }


    

  }




  function debounce(func, wait, immediate) {
    var timeout;
    return function() {
      var context = this, args = arguments;
      var later = function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  };






  
  search.addEventListener('input', function(){

    
    matchList.style = 'width:' + search.offsetWidth + '; height: 300px; line-height: 3em; overflow:scroll; border: thin #000 solid; padding: 5px;'

    if (search.value.length === 0) {
      matchList.style = '';
      matchList.innerHTML = '';
    }

  });

  
  search.addEventListener('keypress',myEfficientFn);



  


  
 


});







