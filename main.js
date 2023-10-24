document.getElementById("commit_roll").addEventListener("click", diceMain);


function countMatches(arr, item) {
    let j = 0;
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] === item) j++;
    }
    return j;
}

//I copied my work from the Ordinal Adjectives assignment.
function toOrdinal(num) {
    let suffix;
    if (num % 100 >= 11 && num % 100 <= 13) { // "eleventh", "twelfth", "thirteenth"
        suffix = "th";
    } else if (num % 10 == 1) { // "first"
        suffix = "st";
    } else if (num % 10 == 2) { // "second"
        suffix = "nd";
    } else if (num % 10 == 3) { // "third"
        suffix = "rd";
    } else { //All other numbers end in "th"
        suffix = "th";
    }
    return String(num) + suffix;
}

function showMessageInTable(msg) {
    document.getElementById("final-roll-count").innerHTML = "";

    let out = document.getElementById("roll-list");
    while (out.hasChildNodes())
        out.removeChild(out.firstChild);
    let tr = document.createElement("tr");
    let td = document.createElement("td");
    td.innerText = msg;
    tr.appendChild(td);
    out.appendChild(tr);
}

//MAIN DICE ROLLING FUNCTIONALITY
function doRoll(n) {
    let roll = [];
    for (let roll_i = 0; roll_i < n; roll_i++)
        roll.push(1 + Math.floor(6 * Math.random()));
    return roll;
}
function diceMain() {
    const n = Number(document.getElementById("dice_count").value);
    if (n <= 0) {
        let msg = "You must roll at least one die.";
        showMessageInTable(msg);
        throw new Error(msg);
    } else if (isNaN(n)) {
        let msg = "Number of dice must be a number.";
        showMessageInTable(msg);
        throw new Error(msg);
    } else if (!isFinite(n)) {
        let msg = "Number of dice must be finite.";
        showMessageInTable(msg);
        throw new Error(msg);
    }

    let rollList = []; //We will store the results of the rolls here.
    let loopType, cond;
    
    /*
        Figure out what kind of loop to use
    */
    if (document.getElementById("5_times").checked) {
        // I will use a "for" loop when the number of rolls is known.
        // "cond" will be the number of rolls, so the code will be like this:
        /*
        for (let i = 0; i < cond; i++) {
            roll = doRoll(n);
            //other stuff...
        }
        */
        loopType = 'for';
        cond = 5;
    } else if (document.getElementById("n_times").checked) {
        loopType = 'for';
        cond = Number(document.getElementById("roll_count").value);
        if (cond <= 0) {
            let msg = "You should roll at least once.";
            showMessageInTable(msg);
            throw new Error(msg);
        } else if (isNaN(cond)) {
            let msg = "Number of rolls must be a number.";
            showMessageInTable(msg);
            throw new Error(msg);
        } else if (!isFinite(cond)) {
            let msg = "Number of rolls must be finite.";
            showMessageInTable(msg);
            throw new Error(msg);
        }
    } else if (document.getElementById("until").checked) {
        // I will use a "do...while" loop for unknown numbers of rolls.
        // "cond" will be set as a function that returns a boolean, so that I can 
        // do something like this:
        /*
        do {
            roll = doRoll(n);
            //other stuff...
        } while (cond(roll));
        */
        loopType = 'dowhile';

        //Convert desired outcome to an array of numbers
        var desiredRoll = document.getElementById("until_outcome").value;
        if (/.*[^123456, ].*/i.test(desiredRoll)) {
            let msg = "Final dice roll must consist of comma-separated numbers from 1 to 6.";
            showMessageInTable(msg);
            throw new Error(msg);
        }

        desiredRoll = desiredRoll.split(',');
        for (let i = 0; i < desiredRoll.length; i++) {
            desiredRoll[i] = Number(desiredRoll[i]);
            if (![1,2,3,4,5,6].includes(desiredRoll[i])) {
                let msg = "Final dice roll must consist of comma-separated numbers from 1 to 6.";
                showMessageInTable(msg);
                throw new Error(msg);
            }
        }

        if (desiredRoll.length > n) {
            let msg = "The desired dice roll outcome can't have more items than there are dice.";
            showMessageInTable(msg);
            throw new Error(msg);
        }
        var ordered = document.getElementById("preserve_order").checked;
        if (ordered) {
            // Make arrays into strings, then take advantage of string matching functions.
            // I'm doing it this way because I'm lazy.
            cond = (roll) => {
                return !(roll.join('_').includes(desiredRoll.join('_')));
            }
        } else {
            // Now I *could* make a string and then use regular expressions, but the sheer number of
            // look-ahead assertions would make that really slow. It's better to just write a
            // proper function for this.
            cond = (roll) => {
                for (let item = 1; item <= 6; item++) { //Go through possible dice rolls
                    if (countMatches(roll, item) < countMatches(desiredRoll, item))
                        return true;
                }
                return false;
            }
        }
    } else {
        let msg = "Please choose an option.";
        showMessageInTable(msg);
        throw new Error(msg);
    }

    // Okay, so now that the program has figured out what
    // kind of loop to use, it is time to roll the dice.
    if (loopType === 'for') {
        for (let i = 0; i < cond; i++) {
            roll = doRoll(n);
            rollList.push(roll);
        }
    } else if (loopType === 'dowhile') {
        do {
            roll = doRoll(n);
            rollList.push(roll);
        } while (cond(roll));
    }
    //Display the number of rolls
    document.getElementById("final-roll-count").innerText = `${rollList.length} rolls`;

    //Now display the rolls
    //Clear the table of previous roll results, if any
    let out = document.getElementById("roll-list");
    while (out.hasChildNodes())
        out.removeChild(out.firstChild);

    //Populate the table
    for (let i = 0; i < rollList.length; i++) {
        tr = document.createElement("tr");

        //Start by labelling the row ("1st roll", "2nd roll", etc.)
        let td = document.createElement("th");
        td.innerText = `${toOrdinal(i+1)} roll`;
        tr.appendChild(td);

        //Add the outcomes of all the rolls
        for (let j = 0; j < rollList[i].length; j++) {
            td = document.createElement("td");
            td.innerText = rollList[i][j];
            tr.appendChild(td);
        }
        out.appendChild(tr);
    }
}