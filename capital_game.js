

// This allows the Javascript code inside this block to only run when the page
// has finished loading in the browser.
$.extend($.ui.autocomplete.prototype.options, {
	open: function(event, ui) {
		$(this).autocomplete("widget").css({
            "width": ($(this).width() + "px")
        });
    }
});
$( document ).ready(function() {
  var question = document.getElementById("pr2__question")
  var answer = document.getElementById("pr2__answer")
  var submit = document.getElementById("pr2__submit")
  var table = document.getElementById("table")
  var radios = [document.getElementById("all"), document.getElementById("corOnly"), document.getElementById("incOnly")];
  var clear = document.getElementById("pr3__clear");
  var undo = document.getElementById("pr3__undo");
  var restart = document.getElementById("pr3__restart");
  var iframe = document.getElementById("iframe");
  var map = document.getElementById("map");
  
  var currentCountry;
  var csvArray;
  var numOfCorr = 0;
  var country_capital_pairs = [];
  var clearFlag = false;
  var root = database.ref();
  var btnToTrigger = radios[0];
  var delay = 500;
  function writeData(entry){
    var ref = database.ref().child("entries").child(entry.time);
    var now = new Date();
    ref.set({
      country: entry.country,
      capital: entry.capital,
      isCorrect: entry.isCorrect,
      inp: entry.inp
    })
    root.child("Undo").child(now.getTime()).child("Add").set({
      country: entry.country,
      capital: entry.capital,
      isCorrect: entry.isCorrect,
      inp: entry.inp,
      time: entry.time
    });
  }
  
  var all = [];
  var buttons = [];

  var request = new XMLHttpRequest();
	request.open("GET",'https://s3.ap-northeast-2.amazonaws.com/ec2-54-144-69-91.compute-1.amazonaws.com/country_capital_pairs_2019.csv');
	request.addEventListener('load', function(event) {
	   if (request.status >= 200 && request.status < 300) {
	      	let csv = request.responseText;
	      	let lines = csv.split('\r\n');
	      	for (let i=1; i<lines.length; i++){
	      		let pair = lines[i].split(',');
	      		country_capital_pairs.push({"country": pair[0], "capital": pair[1]});
	      	}
        function Entry(country, capital, inp, isCorrect, time){
          this.country = country;
          this.capital = capital;
          this.isCorrect = isCorrect;
          this.inp = inp;
          this.time = time;
        }
        
        answer.focus()
        var k = 3
        function random(min, max){
          var num = min + Math.floor(Math.random() * (max - min + 1));
          return num;
        }
      
        question.innerHTML = country_capital_pairs[random(0, country_capital_pairs.length)].country
        currentCountry = question.innerHTML;
        iframe.src = "https://www.google.com/maps/embed/v1/place?key=AIzaSyDsighQ069CvUZZs4GzGeBpcmrsMKldxcM&q=" + currentCountry + "&language=en&maptype=roadmap"
        function noEntryAdd(){
          var row = table.insertRow(4)
          var c = row.insertCell(0)
          c.colSpan = 3;
          c.innerHTML = "No entry to show";
          c.setAttribute('style', 'text-align: center;');
          k++;
        }
        
      
        function compare(a,b) {
          if (a.time < b.time)
            return -1;
          if (a.time > b.time)
            return 1;
          return 0;
        }
      
        root.child("entries").on("child_added", function(childSnapshot, prevChildKey){
          var val = childSnapshot.val();
          all.push(new Entry(val.country, val.capital, val.inp, val.isCorrect, childSnapshot.key));
          all.sort(compare)
          if (val.isCorrect) numOfCorr++;
          core(btnToTrigger);
        });
        root.child("entries").on("child_removed", function(oldChildSnapshot){
          core(btnToTrigger);
        });
      
          
        root.child("entries").once('value').then(function(ds){
          var i = 0;
          ds.forEach(function(data){
            i++;
          })
          if (i == 0) noEntryAdd()
        })
        submit.onclick = function(){
          /*if (all.length == 0 && radios[0].checked){
            table.deleteRow(3)
            k--;
          }
          if (numOfCorr == 0 && radios[1].checked){
            table.deleteRow(3)
            k--;
          }
          if (all.length - numOfCorr == 0 && radios[2].checked){
            table.deleteRow(3)
            k--;
          }*/
      
          var corAns;
          for (var i = 0; i < country_capital_pairs.length; i++){
            if (country_capital_pairs[i].country == question.innerHTML){
              corAns = country_capital_pairs[i].capital;
              break;
            }
          }
          const now = new Date();
          if (corAns.toLowerCase() == answer.value.toLowerCase()){
            var ent = new Entry(question.innerHTML, corAns, answer.value, true, now.getTime());
            //all.push(ent);
            if (radios[2].checked){
              radios[0].checked = true;
              
              btnToTrigger = radios[0];
              //core(radios[0]);
            }
            writeData(ent);
            //else insertCor(question.innerHTML, corAns);
          } 
          else{
            var ent = new Entry(question.innerHTML, corAns, answer.value, false, now.getTime())
            //all.push(ent);
            if (radios[1].checked){
              radios[0].checked = true;
              btnToTrigger = radios[0];
              
              //core(radios[0]);
            }
            writeData(ent);
            //else insertinCor(question.innerHTML, corAns, answer.value);
          }
          var ctry = country_capital_pairs[random(0, country_capital_pairs.length - 1)].country
          question.innerHTML = ctry
          currentCountry = ctry;
          iframe.src = "https://www.google.com/maps/embed/v1/place?key=AIzaSyDsighQ069CvUZZs4GzGeBpcmrsMKldxcM&q=" + currentCountry + "&language=en&maptype=roadmap"
          answer.value = ""
          answer.focus() 
        }
      
        let flag = false;
        $('#pr2__answer').autocomplete({
          minLength: 2,
          source: function (request, response) {
            response($.map(country_capital_pairs, function (value, key) {
              var name = value.capital.toLowerCase();
              
              if (name.includes(request.term.toLowerCase())) {				
                return {
                  label: value.capital,
                  value: value.capital
                }
              } else {
                return null;
              }
              }));
          },
          select: function (event, ui){
            $('#pr2__answer').val(ui.item.label);
            flag = true;
            submit.click();
            return false;
          }
        });
        for (var i = 0; i < radios.length; i++){
          radios[i].onchange = function() {
            btnToTrigger = this;
            core(this);
          }
      
        }
      
      
        function deleteEntry(btn){
          var pos = Number.parseInt(btn.id);
          table.deleteRow(4 + pos);
          var realPos = 0;
          var sofar = pos;
          if (radios[0].checked){
            realPos = pos;
            if (all[realPos].isCorrect) numOfCorr--;
          }
          else if (radios[1].checked){
            for (var j = 0; j < all.length; j++){
              if (all[j].isCorrect){
                sofar--;
              }if (sofar < 0){
                realPos = j;
                break;
              }
            }
            numOfCorr--; 
          }else{
            for (var j = 0; j < all.length; j++){
              if (!all[j].isCorrect){
                sofar--;
              }if (sofar < 0){
                realPos = j;
                break;
              }
            }
          }
          
          k--;
          if (k == 3){
            noEntryAdd();
          }
          var deletedEntry = all[realPos];
      
          for (var i = pos; i < buttons.length - 1; i++){
            buttons[i] = buttons[i + 1]
            buttons[i].id = i
          }buttons.pop();
          for (var i = realPos; i < all.length - 1; i++){
            all[i] = all[i + 1]
          }all.pop();
          root.child("entries").child(deletedEntry.time).remove();
          var now = new Date()
          root.child("Undo").child(now.getTime()).child("Delete").set({
            country: deletedEntry.country,
            capital: deletedEntry.capital,
            isCorrect: deletedEntry.isCorrect,
            inp: deletedEntry.inp,
            time: deletedEntry.time
          })
      
        }
        clear.onclick = function(){
          var now = new Date();
          clearFlag = true;
          root.child("entries").once('value').then(function(snapshot){
            root.child("Undo").child(now.getTime()).child("Clear").set(snapshot.val());
            root.child("entries").remove();
            all = [];
            numOfCorr = 0;
            core(btnToTrigger);
            clearFlag = false;
          });
      
      
          
          
        }
        function core(x){
          while (k != 3){
            table.deleteRow(k);
            k = k - 1;
          }
          buttons = []
          if (x.id == "all"){
            if (all.length == 0){
              noEntryAdd()
            }
            for (var j = 0; j < all.length; j++){
              if (all[j].isCorrect){
                insertCor(all[j].country, all[j].capital);
              }else{
                insertinCor(all[j].country, all[j].capital, all[j].inp);
              }
            }
          }else if (x.id == "corOnly"){
            if (numOfCorr == 0){
              noEntryAdd();
            }
            for (var j = 0; j < all.length; j++){
              if (all[j].isCorrect){
                insertCor(all[j].country, all[j].capital);
              }
            }
          }else{
            if (all.length - numOfCorr == 0){
              noEntryAdd();
            }
            for (var j = 0; j < all.length; j++){
              if (!all[j].isCorrect){
                insertinCor(all[j].country, all[j].capital, all[j].inp);
              }
            }
          }
        }
        function insertCor(country, capital) {
          k++;
          var row = table.insertRow(k)
          row.className = "correct";
          var countryCell = row.insertCell(0);
          
          countryCell.innerHTML = country;
          var x = row.insertCell(1);
          x.innerHTML = capital;
          var c = row.insertCell(2);
          var timer;
          $(countryCell).on({
            'mouseover': function () {
                timer = setTimeout(function () {
                    iframe.src = "https://www.google.com/maps/embed/v1/place?key=AIzaSyDsighQ069CvUZZs4GzGeBpcmrsMKldxcM&q=" + countryCell.innerHTML + "&language=en&maptype=roadmap"
                    iframe.style.border = '3px solid orange'
                    
                }, delay);
            },
            'mouseout' : function () {
                iframe.src = "https://www.google.com/maps/embed/v1/place?key=AIzaSyDsighQ069CvUZZs4GzGeBpcmrsMKldxcM&q=" + currentCountry + "&language=en&maptype=roadmap"
                iframe.style.border = '0';
                clearTimeout(timer);
            }
        });
          var div = document.createElement("span");
          div.innerHTML = capital;
          c.appendChild(div);
          var btn = document.createElement("BUTTON");
          btn.innerText = "Delete";
          btn.id = k - 4;
          buttons.push(btn);
          btn.onclick = function() {
            
            deleteEntry(this);
          }
          c.appendChild(btn);
          
          $(countryCell).hover(function(){
            $(row).css("background-color", "lightgrey");
          }, function(){
            $(row).css("background-color", "transparent");
          })
          $(div).hover(function(){
            $(row).css("background-color", "lightgrey");
          }, function(){
            $(row).css("background-color", "transparent");
          })
          $(x).hover(function(){
            $(row).css("background-color", "transparent");
          }, function(){
            $(row).css("background-color", "transparent");
          })
          $(div).on({
            'mouseover': function () {
              timer = setTimeout(function () {
                  iframe.src = "https://www.google.com/maps/embed/v1/place?key=AIzaSyDsighQ069CvUZZs4GzGeBpcmrsMKldxcM&q=" + capital + "&language=en&maptype=roadmap&zoom=4"
                  map.style = "-webkit-filter: grayscale(100%);filter: grayscale(100%);"
                  iframe.style.border = '3px solid black';
                  
              }, 0);
          },
            'mouseout' : function () {
                iframe.src = "https://www.google.com/maps/embed/v1/place?key=AIzaSyDsighQ069CvUZZs4GzGeBpcmrsMKldxcM&q=" + currentCountry + "&language=en&maptype=roadmap"
                map.style = "";
                iframe.style.border = '0';
                clearTimeout(timer);
            }
          })

        }
        function insertinCor(country, capital, inp){
          k++;
          var timer;
          var row = table.insertRow(k)
          row.className = "incorrect"
          var countryCell = row.insertCell(0);
          countryCell.innerHTML = country;
          var incCell = row.insertCell(1);
          incCell.innerHTML = inp;
          incCell.id = "incCity";
          var btn = document.createElement("BUTTON");
          btn.innerText = "Delete";
          btn.id = k - 4
          buttons.push(btn);
          btn.onclick = function() {
            
            deleteEntry(this);
          }
          var c = row.insertCell(2);
          var div = document.createElement("span");
          div.innerHTML = capital;
          c.appendChild(div);
          c.appendChild(btn);
          $(countryCell).on({
            'mouseover': function () {
                timer = setTimeout(function () {
                    iframe.src = "https://www.google.com/maps/embed/v1/place?key=AIzaSyDsighQ069CvUZZs4GzGeBpcmrsMKldxcM&q=" + countryCell.innerHTML + "&language=en&maptype=roadmap"
                    iframe.style.border = '3px solid orange';
                    
                }, delay);
            },
            'mouseout' : function () {
                //iframe.src = "https://www.google.com/maps/embed/v1/place?key=AIzaSyDsighQ069CvUZZs4GzGeBpcmrsMKldxcM&q=" + currentCountry + "&language=en&maptype=roadmap"
                map.style = "";
                
                iframe.style.border = '0';
                clearTimeout(timer);
            }
        });
        $(countryCell).hover(function(){
          $(row).css("background-color", "lightgrey");
        }, function(){
          $(row).css("background-color", "transparent");
        })
        $(div).hover(function(){
          $(row).css("background-color", "lightgrey");
        }, function(){
          $(row).css("background-color", "transparent");
        })
        $(incCell).hover(function(){
          $(row).css("background-color", "transparent");
        }, function(){
          $(row).css("background-color", "transparent");
        })
          $(div).on({
            'mouseover': function () {
              timer = setTimeout(function () {
                  iframe.src = "https://www.google.com/maps/embed/v1/place?key=AIzaSyDsighQ069CvUZZs4GzGeBpcmrsMKldxcM&q=" + capital + "&language=en&maptype=roadmap&zoom=4"
                  map.style = "-webkit-filter: grayscale(100%);filter: grayscale(100%);"
                  iframe.style.border = '3px solid black';
                  
              }, 0);
          },
            'mouseout' : function () {
                //iframe.src = "https://www.google.com/maps/embed/v1/place?key=AIzaSyDsighQ069CvUZZs4GzGeBpcmrsMKldxcM&q=" + currentCountry + "&language=en&maptype=roadmap"
                map.style = "";
                iframe.style.border = '0';
                clearTimeout(timer);
            }
          })
        }
        answer.addEventListener("keydown", function(event) {
          if (event.keyCode === 13 && !flag){
            submit.click()
            $('#pr2__answer').autocomplete("close");
          }flag = false;
        })
        
        $(question).on({
          'mouseover': function () {
              timer = setTimeout(function () {
                  iframe.src = "https://www.google.com/maps/embed/v1/place?key=AIzaSyDsighQ069CvUZZs4GzGeBpcmrsMKldxcM&q=" + question.innerHTML + "&language=en&maptype=roadmap"
                  iframe.style.border = '3px solid orange';
                  
              }, delay);
          },
          'mouseout' : function () {
              //iframe.src = "https://www.google.com/maps/embed/v1/place?key=AIzaSyDsighQ069CvUZZs4GzGeBpcmrsMKldxcM&q=" + currentCountry + "&language=en&maptype=roadmap"
              map.style = "";
              
              iframe.style.border = '0';
              clearTimeout(timer);
          }
      });
      
      
        undo.onclick = function(){
          var whatToUndo;
          root.child("Undo").orderByKey().limitToLast(1).once('value').then(function(dataSnapshot){
            dataSnapshot.forEach(function(data){
                Object.keys(data.val()).forEach(function(key){
                  whatToUndo = key;
                })
                var val = data.val()[whatToUndo];
                if (whatToUndo == "Delete"){
                  var ent = new Entry(val.country, val.capital, val.inp, val.isCorrect, val.time);
                  var ref = database.ref().child("entries").child(val.time);
                  ref.set({
                    country: val.country,
                    capital: val.capital,
                    isCorrect: val.isCorrect,
                    inp: val.inp
                  })
                  root.child("Undo").child(data.key).remove()
                }
                else if (whatToUndo == "Add"){
                  var a = all.pop()
                  if (a.isCorrect) numOfCorr--;
                  root.child("entries").child(val.time).remove()
                  root.child("Undo").child(data.key).remove()
                }
                else if (whatToUndo == "Clear"){
                  
                  Object.keys(val).forEach(function(key){
                    root.child("entries").child(key).set({
                      country: val[key].country,
                      capital: val[key].capital,
                      isCorrect: val[key].isCorrect,
                      inp: val[key].inp
                    })
                  })
                }root.child("Undo").child(data.key).remove()
            })
          })
        }
        root.on('value', function(ds){
          var size = 0;  
          if (!ds.exists()){
            undo.disabled = true;
            return;
          }
          Object.keys(ds.val()).forEach(function(key){
              if (key == "Undo"){
                Object.keys(ds.val()["Undo"]).forEach(function(key1){
                  size++;
                })
              }
            })
          if (size == 0) undo.disabled = true;
          else undo.disabled = false;
        })
        restart.onclick = function(){
          root.child("Undo").remove()
          root.child("entries").remove()
          question.innerHTML = country_capital_pairs[random(0, country_capital_pairs.length)].country
          currentCountry = question.innerHTML;
          iframe.src = "https://www.google.com/maps/embed/v1/place?key=AIzaSyDsighQ069CvUZZs4GzGeBpcmrsMKldxcM&q=" + currentCountry + "&language=en&maptype=roadmap"
          all = []
          numOfCorr = 0;
          radios[0].checked = true;
          core(radios[0]);
          btnToTrigger = radios[0];
          undo.disabled = true
          answer.value = ""
        }
      }
    });
    request.send();
    

})

