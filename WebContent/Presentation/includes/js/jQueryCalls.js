var gridSqaureIDName = "field_"; //id name for each grid square, allows for easy UI updates
var winningCombinations = [[0,1,2],
					        [3,4,5],
					        [6,7,8],
					        [0,3,6],
					        [1,4,7],
					        [2,5,8],
					        [0,4,8],
					        [2,4,6],
					        ]; //possible winning combinations
var playerChar = "X"; //will keep letter value of player (X or O)
var aiChar = "O"; //will keep letter value of AI (X or O)

jQuery(document).ready(function()
{//used when document is readys
	
	//defaultValues for AJAX calls	
	jQuery.ajaxSetup (
	{
		cache: false
	});
	
	setupTTTGrid();//setup 3x3 TTT grid
	setupClickHandlers(); //creates clicking functionality for each square
	
});//end jQuery(document).ready

function setupTTTGrid()
{//setup 3x3 TTT grid
	
	for(var a=0; a < 9; a++)
	{
		jQuery("#mainGrid")
		.append("<td id='"+gridSqaureIDName + a+"' class='TTTGrid'></td>");		
		
		switch(a%3)
		{
			case 0:
				jQuery("#mainGrid #"+gridSqaureIDName + a)
				.before("<tr>");
				break;		
		}//end switch
	}//end for(var a=0; a < 9; a++) 
}//end setupTTTGrid()

function setupClickHandlers()
{//creates clicking functionality for each square
	
	jQuery("td[id^="+gridSqaureIDName+"]").on("click", "", "", function()
	{
		xoPlacement(jQuery(this));
	});
}//end setupClickHandlers()

function disableClickHandlers()
{//disable clicks
	
	jQuery("td[id^="+gridSqaureIDName+"]").off("click", "", "", function()
			{
				xoPlacement(jQuery(this));
			});
}

function xoPlacement(selectedFieldObject)
{//method to place human and AI selection	
		
	var cellValue = selectedFieldObject.text();
	
	if(cellValue.length == 0)
	{
		resetMsg(); //clear the ai messages
		
		setGridTextVal(selectedFieldObject, playerChar); //place odd move's (1, 3, 5...) before even
		
		aiMove(selectedFieldObject);//determine AI's move
		
	}//end if(cellText == "")
	else
	{		
		switch (cellValue)
		{
			case aiChar:
			{
				setBottomMessage("Come on!<br>You can't erase my move.");
				break;
			}
			case playerChar:
			{
				setBottomMessage("You can't take your move back!");
				break;
			}
		}//end switch
	}//end if(cellValue == "")
}// end xoPlacement(selectedField)

function setGridTextVal(selectedFieldObject, xORo)
{
	selectedFieldObject.text(xORo); //place selection in grid
	updateWinningComboArray(selectedFieldObject); //update winning combo nested array's with X or O
	
}//end setGridTextVal(selectedFieldObject, xORo)

function aiMove(selectedFieldObject)
{	
	var humanMoves = jQuery("#mainGrid > td[id^="+gridSqaureIDName+"]:contains('"+playerChar+"')").length;
	
	//AI take center square if available and only 1 human value is on the board
	if( (jQuery("#"+gridSqaureIDName+"4").text() == "") && (humanMoves == 1) )
	{
		setGridTextVal(jQuery("#"+gridSqaureIDName+"4"), aiChar); //set grid value
	}//end if( (jQuery("#"+gridSqaureIDName+"4").text() == "") && (humanMoves == 1) )
	else if(humanMoves == 1)
	{//if human took center square on move #1 then randomly take a corner value
		var cornerFields = [0, 2, 6, 8];		
		setGridTextVal(jQuery("#"+gridSqaureIDName+(cornerFields[Math.floor(Math.random() * cornerFields.length)])), aiChar);	//set grid value
	}//end else if (humanMoves == 1)
	else if(humanMoves > 1)
	{	
		var winORblock = canWin(aiChar, playerChar, "AI");
			
		if(winORblock == -1)
		{
			winORblock = canLose_or_Open(aiChar, playerChar, "AI");
		} //throw the block
		
		if(typeof winORblock != "undefined")
		{
			setGridTextVal(jQuery("#"+gridSqaureIDName+winORblock), aiChar); //set grid value
		}
			
	}//end else if(humanMoves > 1)
				
}//end aiMove(selectedField)

function isDraw()
{//
	/*
	var mergedComb = "";
	mergedComb = mergedComb.concat.apply(mergedComb, winningCombinations); //merge multi-arry for more efficient search
	
	var regExp = new RegExp("[0-9]","g");
	var matchInts = mergedComb.toString().match(regExp); 
	*/
	disableClickHandlers();
	setBottomMessage("Draw! <br>Play  again? <span id='playAgain' onclick=(resetGame())>Yes</span>");
	
}//end isDraw()

function countChar(charToCount, winnCommArr)
{
	var count = 0;
	
	for(var a=0; a < winningCombinations.length; a++)
	{	
		
		count = winnCommArr.reduce(function(n, val) 
				{
		    return n + (val === charToCount);
				}, 0
		);
	}//end for
		
	return count;
}//end countChar

function canWin(charToCheck, blocker, player)
{
	var winblockValue = -1; //-1 is false
	
	for(var a=0; a < winningCombinations.length; a++)
	{	
		
		var countCharToCheck = countChar(charToCheck, winningCombinations[a]);
		var countBlocker = countChar(blocker, winningCombinations[a]);

		if( (countCharToCheck == 2) && (countBlocker == 0) )
		{//true: beat player
			disableClickHandlers();
			setBottomMessage("I win!<br>Try your luck again? <span id='playAgain' onclick=(resetGame())>Yes</span>");
			return winblockValue = getWinBlockValue(charToCheck, winningCombinations[a]);
			
		}//end if( (countCharToCheck == 2) && (countBlocker == 0) )
		
		
	}//for(var a=0; a < winningCombinations.length; a++)
	
	return winblockValue;
}//end canWin(charToCheck, blocker, player)

function canLose_or_Open(charToCheck, blocker, player)
{
	var winblockValue = -1; //-1 is false	
	
	for(var a=0; a < winningCombinations.length; a++)
	{
		var countCharToCheck = countChar(charToCheck, winningCombinations[a]);
		var countBlocker = countChar(blocker, winningCombinations[a]);
	
		//alert("winning[a]"+winningCombinations[a]+"...check: "+countCharToCheck+" --- blocker"+countBlocker);

		if( (countCharToCheck == 0) && (countBlocker == 2))
		{//true: block player				
			return winblockValue = getWinBlockValue(blocker, winningCombinations[a]);
		}//end else if( (countCharToCheck == 0) && (countBlocker == 2) )						
	}//for(var a=0; a < winningCombinations.length; a++)

	if(winblockValue = -1)
	{//means there is an open move
		return winblockValue = getOpenValue(charToCheck, blocker, winningCombinations);	
	}//if(winblockValue = -1)
	
	return winblockValue;
}//end canLose

function getWinBlockValue(remove, winnComboArr)
{
	var val = -1;
	
	for(var b=0; b < winnComboArr.length; b++)
	{//remove X's or O's
		val = winnComboArr;
		val.splice(jQuery.inArray(remove, val) , 1);		
	}//end for
	
	return val;
}//end getWinBlockValue(remove, winnComboArr)

function getOpenValue(remove1, remove2, winComboArr)
{//return an random open value since win or block isn't possible
	
	var remainingVals = [];
	for(var a=0; a < winComboArr.length; a++)
	{
		for(var b=0; b < winComboArr[b].length; b++)
		{	
			if(remove1 != winComboArr[a][b] && remove2 != winComboArr[a][b] && typeof winComboArr[a][b] != "undefined" && remainingVals.indexOf(winComboArr[a][b]) == -1)
			{
				remainingVals.push(winComboArr[a][b]); //add remaing open field #'s
			}
		}//end for(var b=0; b < winningCombinations.length; b++) 
	}//end for(var a=0; a < winningCombinations.length; a++)
	
	if(remainingVals.length == 0)
	{
		isDraw();
	}
	
	return remainingVals[Math.floor(Math.random() * remainingVals.length)]; //return a random open number

}//end getWinBlockValue(remove, winnComboArr)

function updateWinningComboArray(selectedFieldObject)
{	
	for(var a=0; a < winningCombinations.length; a++)
	{//loop through each winning combination to replace values w/ X or O
		var fieldNumValue = parseInt(selectedFieldObject.attr('id').replace(gridSqaureIDName,''));
		
		if(jQuery.inArray(fieldNumValue, winningCombinations[a]) != -1)
		{//replace
			var indexVal = winningCombinations[a].indexOf(fieldNumValue);
			winningCombinations[a][indexVal] = selectedFieldObject.text();
		}//end if
	}//for(var a=0; a < winningCombinations.length; a++)
		
}//end 

function setBottomMessage(value)
{//sets msg below the TTT grid
	jQuery("#messages").html(value);
}//setBottomMessage(value)


//////////////////////////////////reset functions///////////////////////////////////

function resetGlobals()
{
	winningCombinations  = [[0,1,2],
					        [3,4,5],
					        [6,7,8],
					        [0,3,6],
					        [1,4,7],
					        [2,5,8],
					        [0,4,8],
					        [2,4,6],
					        ]; //possible winning combinations
}//resetGlobals

function resetGrid()
{
	//will clear the grid of X's and O's
	for(var a=0; a< jQuery("#mainGrid > td[id^="+gridSqaureIDName+"]").length; a++)
	{
		jQuery("#"+gridSqaureIDName+a).text("");
	}//end for
	
}//end resetGrid

function resetMsg()
{
	jQuery("#messages").text(""); //reset msg text
}//end resetMsg()

function resetGame()
{
	resetGrid();
	resetMsg();
	resetGlobals();
	setupClickHandlers();
}//end resetGame