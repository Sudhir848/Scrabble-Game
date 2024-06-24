$(document).ready(function () {
    const RACK_MAX_TILES = 7;
    const BOARD_SLOTS = 7;
    let totalScore = 0;

    var ObjScrabble = {
        dictTiles: [],
        bag: [],
        init: function () {
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

            this.bag = [];
            for (let key in this.dictTiles) {
                for (let i = 0; i < this.dictTiles[key].quantity; ++i) {
                    this.bag.push(key);
                }
            }
        },
        drawTileFromBag: function () {
            if (this.bag.length < 1)
                return null;
            const randIndex = Math.floor(Math.random() * this.bag.length);
            const tile = this.bag.splice(randIndex, 1)[0];
            return tile;
        }
    };

    ObjScrabble.init();

    function createBoard() {
        $('#board').empty(); // Clear existing board slots
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

    function drawHand() {
        const $rack = $('#rack');
        $rack.empty(); // Clear existing tiles
        const $tile = $('<img>').addClass('tile draggable ui-widget-content');
        for (let i = 0; i < RACK_MAX_TILES; ++i) {
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

    function refreshScoreboard() {
        let stringWord = "";
        let score = 0;
        let letterMult = 1;
        let wordMult = 1;

        $('.slot').each(function () {
            const $this = $(this);
            const $child = $this.find('img');
            if ($child.length > 0) {
                stringWord += $child.attr('letter');
                const letterVal = parseInt($child.attr('value'), 10);
                letterMult = parseInt($this.attr('letter-mult'), 10);
                score += (letterVal * letterMult);
                wordMult *= parseInt($this.attr('word-mult'), 10);
            } else {
                stringWord += '.';
            }
        });
        $('#word').text(stringWord);
        $('#cur-score').text(score * wordMult);
        $('#bag').text(ObjScrabble.bag.length);
    }

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

    function makeTilesDroppable() {
        $('.slot').droppable({
            tolerance: 'intersect',
            hoverClass: 'drop-hover',
            drop: function (event, ui) {
                const $this = $(this);
                if ($this.children().length === 0) {
                    ui.draggable.detach().css({ top: 0, left: 0 }).addClass('drawn').appendTo($this);
                    refreshScoreboard();
                    $('#next-word').prop('disabled', false);
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

    $('#reset').on('click', function (e) {
        e.preventDefault();
        ObjScrabble.init();
        createBoard();
        drawHand();
        refreshScoreboard();
        totalScore = 0;
        $('#total-score').text(totalScore);
    });

    $('#next-word').on('click', function (e) {
        e.preventDefault();
        $('.slot').empty();
        drawHand();
        const curScore = parseInt($('#cur-score').text(), 10);
        totalScore += curScore;
        $('#total-score').text(totalScore);
        refreshScoreboard();
    });

    createBoard();
    drawHand();
    refreshScoreboard();
    makeTilesDroppable();
});