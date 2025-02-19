/*
Copyright (c) 2024 by Sudhir Gunaseelan. All rights reserved. May be freely copied or
excerpted for educational purposes with credit to the author.
Updated by SG on July 6, 2024, at 2:00 PM.
*/

$(document).ready(function () {
    const RACK_MAX_TILES = 7;
    const BOARD_SLOTS = 7;
    const TOTAL_TILES = 96;
    let totalScore = 0;
    let currentWordScore = 0;
    let firstTilePlaced = false;
    let validWords = [];
    let tilesUsed = 0;

    // Function to validate if a word is in the dictionary
    function isValidWord(word) {
        console.log('Validating word: ${word}');
        return validWords.includes(word.toLowerCase());
    }

    // Function to load the dictionary
    function loadDictionary() {
        return $.ajax({
            url: 'dictionary.txt',
            dataType: 'text',
            success: function (data) {
                validWords = data.split('\n').map(word => word.trim().toLowerCase());
                console.log('Dictionary loaded. Total words: ${validWords.length}');
            },
            error: function () {
                alert('Failed to load the dictionary.');
            }
        });
    }

    var ObjScrabble = {
        dictTiles: [],
        bag: [],
        init: function () {
            // Initialize tile frequencies and values
            this.dictTiles = {
                'A': { value: 1, freq: 9, quantity: 9 },
                'B': { value: 3, freq: 2, quantity: 2 },
                'C': { value: 3, freq: 2, quantity: 2 },
                'D': { value: 2, freq: 4, quantity: 4 },
                'E': { value: 1, freq: 12, quantity: 12 },
                'F': { value: 4, freq: 2, quantity: 2 },
                'G': { value: 2, freq: 3, quantity: 3 },
                'H': { value: 4, freq: 2, quantity: 2 },
                'I': { value: 1, freq: 9, quantity: 9 },
                'J': { value: 8, freq: 1, quantity: 1 },
                'K': { value: 5, freq: 1, quantity: 1 },
                'L': { value: 1, freq: 4, quantity: 4 },
                'M': { value: 3, freq: 2, quantity: 2 },
                'N': { value: 1, freq: 6, quantity: 6 },
                'O': { value: 1, freq: 8, quantity: 8 },
                'P': { value: 3, freq: 2, quantity: 2 },
                'Q': { value: 10, freq: 1, quantity: 1 },
                'R': { value: 1, freq: 6, quantity: 6 },
                'S': { value: 1, freq: 4, quantity: 4 },
                'T': { value: 1, freq: 6, quantity: 6 },
                'U': { value: 1, freq: 4, quantity: 4 },
                'V': { value: 4, freq: 2, quantity: 2 },
                'W': { value: 4, freq: 2, quantity: 2 },
                'X': { value: 8, freq: 1, quantity: 1 },
                'Y': { value: 4, freq: 2, quantity: 2 },
                'Z': { value: 10, freq: 1, quantity: 1 },
                '_': { value: 0, freq: 2, quantity: 2 }
            };

            this.resetBag();
        },
        // Reset the bag with the initial quantities of tiles
        resetBag: function() {
            this.bag = [];
            for (let key in this.dictTiles) {
                for (let i = 0; i < this.dictTiles[key].quantity; ++i) {
                    this.bag.push(key);
                }
            }
            console.log('Bag reset. Total tiles: ${this.bag.length}');
        },
        // Draw a random tile from the bag
        drawTileFromBag: function () {
            if (this.bag.length < 1) {
                console.log("Bag is empty.");
                return null;
            }
            const randIndex = Math.floor(Math.random() * this.bag.length);
            const tile = this.bag.splice(randIndex, 1)[0];
            console.log('Drawn tile: ${tile}');
            return tile;
        }
    };

    ObjScrabble.init();

    // Function to create the game board
    function createBoard() {
        $('#board').empty();
        for (let i = 0; i < BOARD_SLOTS; i++) {
            let slotClass = 'board-blank';
            if (i === 1 || i === 5) slotClass = 'board-double-word';
            if (i === 3) slotClass = 'board-double-letter';

            const $slot = $('<div>').addClass(slotClass + ' slot droppable ui-widget-header')
                .attr('letter-mult', 1)
                .attr('word-mult', 1);

            if (slotClass === 'board-double-word') {
                $slot.attr('word-mult', 2);
            } else if (slotClass === 'board-double-letter') {
                $slot.attr('letter-mult', 2);
            }

            $('#board').append($slot);
        }

        makeTilesDroppable();
    }

    // Function to draw tiles into the player's hand
    function drawHand(existingTiles = []) {
        const $rack = $('#rack');
        $rack.empty();
        console.log("Rack cleared");

        // Check if the game is over
        if (ObjScrabble.bag.length <= 3) {
            const $gameOverMessage = $('<div>').addClass('game-over').text('GAME OVER');
            $rack.append($gameOverMessage);
            console.log("Game Over");
            $('#next-word').prop('disabled', true);
            $('#reset').prop('disabled', false);
            return;
        }

        const $tile = $('<img>').addClass('tile draggable ui-widget-content');

        // Append existing tiles back to the rack
        existingTiles.forEach(tile => {
            const strSrc = 'images/tiles/Scrabble_Tile_' + tile + '.jpg';
            const $existingTile = $tile.clone()
                .attr('value', ObjScrabble.dictTiles[tile].value)
                .attr('letter', tile)
                .attr('src', strSrc)
                .appendTo('#rack');
            console.log('Added existing tile to rack: ${tile}');
        });

        // Draw new tiles to fill the rack up to RACK_MAX_TILES
        const newTilesCount = RACK_MAX_TILES - existingTiles.length;
        for (let i = 0; i < newTilesCount; ++i) {
            const key = ObjScrabble.drawTileFromBag();
            if (key) {
                const strSrc = 'images/tiles/Scrabble_Tile_' + key + '.jpg';
                const $newTile = $tile.clone()
                    .attr('value', ObjScrabble.dictTiles[key].value)
                    .attr('letter', key)
                    .attr('src', strSrc)
                    .appendTo('#rack');
                console.log('Added new tile to rack: ${key}');
            }
        }

        makeTilesDraggable();
    }

    // Function to update the scoreboard based on current placements
    function refreshScoreboard() {
    let stringWord = "";
    let score = 0;
    let wordMult = 1;
    let tilesPlacedOnBoard = 0;

    // Count tiles placed on the board
    $('.slot').each(function () {
        const $this = $(this);
        const $child = $this.find('img');
        if ($child.length > 0) {
            tilesPlacedOnBoard++;
            stringWord += $child.attr('letter');
            const letterVal = parseInt($child.attr('value'), 10);
            const letterMult = parseInt($this.attr('letter-mult'), 10);
            score += (letterVal * letterMult);
            wordMult *= parseInt($this.attr('word-mult'), 10);
        } else {
            stringWord += '.';
        }
    });

    currentWordScore = score * wordMult;
    $('#word').text(stringWord);
    $('#cur-score').text(currentWordScore);

    // Update the remaining tiles count
    const remainingTiles = TOTAL_TILES - tilesUsed - tilesPlacedOnBoard;
    $('#bag').text(remainingTiles);

    const cleanedWord = stringWord.replace(/\./g, '');
    if (cleanedWord.length > 2 && cleanedWord.length === tilesPlacedOnBoard && isValidWord(cleanedWord)) {
        totalScore += currentWordScore;
        tilesUsed += tilesPlacedOnBoard; // Increment tiles used when a word is valid
        $('#total-score').text(totalScore);
        setTimeout(() => moveToNextWord(true), 500);
    }
}

// Update drawHand to Avoid Resetting Remaining Tiles
function drawHand(existingTiles = []) {
    const $rack = $('#rack');
    $rack.empty();

    if (ObjScrabble.bag.length <= 3) {
        const $gameOverMessage = $('<div>').addClass('game-over').text('GAME OVER');
        $rack.append($gameOverMessage);
        $('#next-word').prop('disabled', true);
        $('#reset').prop('disabled', false);
        return;
    }

    const $tile = $('<img>').addClass('tile draggable ui-widget-content');

    // Append existing tiles back to the rack
    existingTiles.forEach(tile => {
        const strSrc = 'images/tiles/Scrabble_Tile_' + tile + '.jpg';
        const $existingTile = $tile.clone()
            .attr('value', ObjScrabble.dictTiles[tile].value)
            .attr('letter', tile)
            .attr('src', strSrc)
            .appendTo('#rack');
    });

    // Draw new tiles to fill the rack up to RACK_MAX_TILES
    const newTilesCount = RACK_MAX_TILES - existingTiles.length;
    for (let i = 0; i < newTilesCount; i++) {
        const key = ObjScrabble.drawTileFromBag();
        if (key) {
            const strSrc = 'images/tiles/Scrabble_Tile_' + key + '.jpg';
            const $newTile = $tile.clone()
                .attr('value', ObjScrabble.dictTiles[key].value)
                .attr('letter', key)
                .attr('src', strSrc)
                .appendTo('#rack');
        }
    }

    makeTilesDraggable();
}
    
    // Make tiles draggable
    function makeTilesDraggable() {
        $('.tile').draggable({
            revert: true,
            revertDuration: 500,
            scroll: false,
            start: function (e, ui) {
                $(this).addClass('hovering');
            },
            stop: function (e, ui) {
                $(this).removeClass('hovering');
            }
        });
    }

    // Make slots droppable
    function makeTilesDroppable() {
        $('.slot').droppable({
            tolerance: 'intersect',
            hoverClass: 'drop-hover',
            drop: function (event, ui) {
                const $this = $(this);
                const $draggable = ui.draggable;

                if ($this.children().length === 0 && validatePlacement($this)) {
                    $draggable.detach().css({ top: 0, left: 0 }).addClass('drawn').appendTo($this);
                    $draggable.draggable('option', 'revert', false);
                    $draggable.draggable('disable');
                    firstTilePlaced = true;
                    refreshScoreboard();
                }
            }
        });

        $('#rack').droppable({
            accept: '.drawn',
            tolerance: 'intersect',
            hoverClass: 'drop-hover',
            drop: function (e, ui) {
                ui.draggable.detach().removeClass('drawn').css({ top: 0, left: 0 }).appendTo($(this));
                refreshScoreboard();
            }
        });
    }

    // Validate the placement of a tile
    function validatePlacement(slot) {
        if (!firstTilePlaced) {
            return true;
        }

        const $slots = $('.slot');
        const index = $slots.index(slot);
        const left = index > 0 ? $slots.eq(index - 1).find('img').length > 0 : false;
        const right = index < $slots.length - 1 ? $slots.eq(index + 1).find('img').length > 0 : false;
        const above = index - BOARD_SLOTS >= 0 ? $slots.eq(index - BOARD_SLOTS).find('img').length > 0 : false;
        const below = index + BOARD_SLOTS < $slots.length ? $slots.eq(index + BOARD_SLOTS).find('img').length > 0 : false;

        return left || right || above || below;
    }

    // Move to the next word, optionally keeping existing tiles
    function moveToNextWord(validWord = false) {
        console.log("moveToNextWord called");

        // Collect existing tiles from the rack if a valid word is formed
        const existingTiles = [];
        if (validWord) {
            $('#rack .tile').each(function () {
                existingTiles.push($(this).attr('letter'));
            });
        }

        // Clear the rack and draw new tiles (keeping existing tiles if a valid word is formed)
        drawHand(validWord ? existingTiles : []);

        // Clear the board and reset for the next word
        $('.slot').empty();
        firstTilePlaced = false;
        currentWordScore = 0; // Reset current word score before refreshing the scoreboard
        refreshScoreboard();
        makeTilesDroppable();
    }

    // Reset button handler
    $('#reset').on('click', function (e) {
        e.preventDefault();
        ObjScrabble.init();
        createBoard();
        drawHand();
        refreshScoreboard();
        totalScore = 0; // Reset total score
        currentWordScore = 0; // Reset current word score
        firstTilePlaced = false;
        $('#total-score').text(totalScore);
        $('#cur-score').text(currentWordScore);
        $('#bag').text(TOTAL_TILES);
        $('#next-word').prop('disabled', false); // Next Word button is enabled on reset
    });

    // Next word button handler
    $('#next-word').on('click', function (e) {
        e.preventDefault();
        console.log("#next-word clicked");
        moveToNextWord(); // Move to next word without keeping existing tiles
    });

    // Load dictionary and initialize the game
    loadDictionary().then(() => {
        createBoard();
        drawHand();
        refreshScoreboard();
        $('#bag').text(TOTAL_TILES);
        $('#next-word').prop('disabled', false); // Next Word button is enabled
        makeTilesDroppable();
    });
});
