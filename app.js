var budgetController = (function() {

    //Expense function constructor
    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome) {

        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } 
        else {
            this.percentage = -1;
        }
    }

    Expense.prototype.getPercentages = function() {
        return this.percentage;
    }


    //Income function constructor
    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    }

    //Calcalate total 
    var calculateTotal = function(type) {
        var sum = 0;

        data.allItems[type].forEach(function(current) {
            sum += current.value;
        });
        data.totals[type] = sum;
    }

    //Data structures for expenses, income and totals
    var data = {

        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    }

    //return function
    return {
        //Add item method
        addItem: function(type, des, val) {
            var newItem, ID;

            //Create new ID 
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }
            else {
                ID = 0;
            }

            //Create item based on 'inc' or 'exp' type
            if (type == 'exp') {
                newItem = new Expense(ID, des, val);
            }
            else if (type === 'inc'){
                newItem = new Income(ID, des, val);
            }

            //Push into data structure 
            data.allItems[type].push(newItem);
            //return element 
            return newItem;
        },

        addOverDraftFee: function() {

            var newFee = this.addItem('exp', 'Overdraft Fee', 15);
            this.calculateBudget();
            this.calculatePercentages();
            
            return newFee;
        },

        deleteItem: function(type, id) {
            var ids, index;

            //id = 6
            
            //[1 2 4 6 8]
            //index = 3

            ids = data.allItems[type].map(function(current) {
              
               return current.id; 

            });
            
            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },

        calculateBudget: function() {

            //Calculate total income and expenses 
            calculateTotal('inc');
            calculateTotal('exp');
            // Calculate budget (income - expenses)
            data.budget = data.totals.inc - data.totals.exp;

            // Calculate percentage of income that we spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            }
            else {
                data.percentage = -1;
            }

        },

        calculatePercentages: function() {

            /*
            a = 20
            b = 10
            c = 40
            income = 100
            a = 20/100 = 20%
            b = 10/100 = 10%
            c = 40/100 = 40%
            */

            data.allItems.exp.forEach(function(cur){
                cur.calcPercentage(data.totals.inc);
            });

        },

        getPercentages: function() {
            var allPerc = data.allItems.exp.map(function(cur){
                return cur.getPercentages();
            });
            return allPerc;
        },

        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },

        //testing method
        testing: function() {
            console.log(data);
        }
    };

})();

//UI Controller
var UIController = (function() {

    //DOM Strings from html file
    var DOMStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month',


    };

    var formatNumber = function(num, type) {
        var numSplit, int, dec;

        /*
        + or - before decimal
        exatly 2 decimal points
        comma seperating the thousands 

        2310.4567 -> + 2,310.46 
        2000 -> + 2,000.00
        */

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }
        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
    };

    var nodeListForEach = function(list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };

    //Return methods
    return {
        //Get input methods from UI 
        getInput: function() {
            return {
                type: document.querySelector(DOMStrings.inputType).value, //will either be inc or exp
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            }
        },

        addListItem: function(obj, type) {
            var html, newHTML, element;

            //Create HTML string with placeholder text 
            if (type === 'inc') {
                element = DOMStrings.incomeContainer;
                html ='<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } 
            else if (type === 'exp'){
                element = DOMStrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            };

            //Replace placeholder text with some actual data

            newHTML = html.replace('%id%', obj.id);
            newHTML = newHTML.replace('%description%', obj.description);
            newHTML = newHTML.replace('%value%', formatNumber(obj.value, type));

            //Insert HTML into DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHTML);

        },

        deleteListItem: function(selectorID) {
            
            var el =  document.getElementById(selectorID);
            el.parentNode.removeChild(el);

        },

        clearFields: function() {
            var fields, fieldsArray;
            
            //QuerySelectAll puts the selections into a list
            fields = document.querySelectorAll(DOMStrings.inputDescription + ',' + DOMStrings.inputValue);
            //Turning the fields list into a fields array
            fieldsArray = Array.prototype.slice.call(fields);

            fieldsArray.forEach(function(current, index, array) {
                current.value = "";
            });

            fieldsArray[0].focus();
        },

        displayBudget: function(obj) {
            var type;

            obj.budget  >= 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMStrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
            

            if (obj.percentage > 0) {
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMStrings.percentageLabel).textContent = '---';
            }

        },

        displayPercentages: function(percentages) {

            var fields = document.querySelectorAll(DOMStrings.expensesPercLabel);

            nodeListForEach(fields, function(current, index) {

                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });
        },

        displayMonth: function() {
            var now, year, month, months;

            now = new Date();

            year = now.getFullYear();
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();

            // Printing the month and year
            document.querySelector(DOMStrings.dateLabel).textContent = months[month] + ' ' + year;

        },

        changedType: function() {

            var fields = document.querySelectorAll(
                DOMStrings.inputType + ',' +
                DOMStrings.inputDescription + ',' +
                DOMStrings.inputValue);
            
            nodeListForEach(fields, function(cur){
                cur.classList.toggle('red-focus');
            });

            document.querySelector(DOMStrings.inputBtn).classList.toggle('red');

        },

 
        //Get DOM strings to use else where in code 
        getDOMStrings: function() {
            return DOMStrings;
        }        
    }

})();

//Controller module 
var controller = (function(budgetCtrl, UICtrl) {

    //Event Listeners (buttons)
    var setupEventListeners = function() {
        //DOM manupulations
        var DOM = UICtrl.getDOMStrings();

        //If add item button is clicked
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        //If enter button is clicked 
        document.addEventListener('keypress', function(event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        //Delete Button
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        //Change Type
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);

    }

    var updateBudget = function() {

         //1. Calculate the budget 
        budgetCtrl.calculateBudget();

        //2. Return the budget
        var budget = budgetCtrl.getBudget();

        //3. Display the budget on the UI 
        UICtrl.displayBudget(budget);

    };

    var updatePercentages = function() {

        // 1. Calculate percentages 
        budgetCtrl.calculatePercentages();
        // 2. Read percentages from the budget controller 
        var percentages = budgetCtrl.getPercentages();
        // 3. Update the UI with the new percentages 
        UICtrl.displayPercentages(percentages);
    }

    //Manupulations to webpage 
    var ctrlAddItem = function() {

        var input, newItem, newUIItem;
         //1. Get the field input data
        input = UICtrl.getInput();

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
             //2. Add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            //3. Add the item to the UI 
            UICtrl.addListItem(newItem, input.type);

             //4. Clear the fields
            UICtrl.clearFields();

            //5. Calculate and update budget 
            updateBudget();

            //6. Calculate and update percentages
            updatePercentages();

             //check for overdraft
             ctrlAddOverdraft();

        }
    };

    var ctrlAddOverdraft = function() {

        if (budgetCtrl.getBudget().totalExp > budgetCtrl.getBudget().totalInc) {
            if (budgetCtrl.getBudget().budget <= 0){
                //Add overdraft fee to data
                var addOverdraft = budgetCtrl.addOverDraftFee();

                //Add overdraft fee to UI
                UICtrl.addListItem(addOverdraft, 'exp');

                //update budget ui
                updateBudget();

                //Calculate and update budget
                updatePercentages();

                alert('You are being charged a $15 overdraft fee for this purchase');
            }
        }
    };


    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {
            
            //inc-1
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            //1. Delete item from data structure
            budgetCtrl.deleteItem(type, ID);

            //2. Delete item from user interface
            UICtrl.deleteListItem(itemID);
            //3. Update and show the new budget
            updateBudget();
            //4. Calculate and update percentages
            updatePercentages();

        }

    };

    //Return methods 
    return {
        //Initializer 
        init: function() {
            console.log('Application has started!');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    };
})(budgetController, UIController);

controller.init();



