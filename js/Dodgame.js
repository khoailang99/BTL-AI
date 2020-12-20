class Dodgame {
    constructor() {
        this.whiteChessPVal = [30, 35, 40, 15, 20, 25, 0, 5, 10];
        this.blackChessPVal = [-10, -25, -40, -5, -20, -35, 0, -15, -30];
        this.initState = [1, 0, 0, 1, 0, 0, 0, 2, 2];
        // this.initState = [1, 0, 0, 2, 2, 2, 0, 2, 0];
        this.numbRowCol = 3;
        this.htmlWhiteChessP = '<div class="chess_box"><div class="chess_pieces red_chess_pieces"></div></div>';
        this.deep = 3;
    }

    // PHẦN XỬ LÝ GIAO DIỆN
    // Khởi tạo game
    InitGame() {
        let htmlChessboard = "";
        let htmlChessPieces = $('.css-nXr1CZ').html();
        let size = this.numbRowCol;
        for (let row = 0; row < size; row++) {
            htmlChessboard += "<tr>";
            for (let col = 0; col < size; col++) {
                htmlChessboard += `<td data-chess-pieces-coord = ${row + "," + col} data-chess-pieces = ${this.initState[row * size + col]}>`;
                htmlChessboard += (this.initState[row * size + col] == 1 ? htmlChessPieces : (this.initState[row * size + col] == 2 ? this.htmlWhiteChessP : "")) + "</td>";
            }
            htmlChessboard += "</tr>";
        }
        $('.chessboard__tbody').html(htmlChessboard);
        this.TriggerEHoverOnChessBox(this, size);
        this.TriggerClickEMoveChessP(this);
    }

    // Thêm sự kiện click cho nút chọn máy đi trước
    ActivateMachineGoFirst(dodgame) {
        $('.css-nYimAv').click(function () {
            let initStatusVal = dodgame.AlphaBeta(dodgame.initState, dodgame.deep, -Infinity, Infinity, false);
            dodgame.UpdateChessPiecesPos(dodgame.numbRowCol, initStatusVal[2].split(',').map(Number), initStatusVal[3].split(',').map(Number), 2);
        });
    }

    // Kích hoạt sự kiện hover trên các ô cờ chứa quân
    TriggerEHoverOnChessBox(objDodGame, size) {
        $('.chessBox-hover').hover(function (event) {
            let chessBox = $(event.currentTarget);
            let coord = chessBox.parent().attr('data-chess-pieces-coord').split(',').map(Number);

            if (objDodGame.initState[(coord[0] - 1) * size + coord[1]] == 0) { chessBox.find('.nvp__top').addClass('active') }
            if (objDodGame.initState[coord[0] * size + coord[1] + 1] <= 0 || coord[1] == size - 1) { chessBox.find('.nvp__right').addClass('active') }
            if (objDodGame.initState[(coord[0] + 1) * size + coord[1]] == 0) { chessBox.find('.nvp__bottom').addClass('active') }
            // if(state[coord[0] * size + coord[1] - 1] == 0) { chessBox.find('.nvp__left').css('opacity', '1')}
        }, function () {
            $('.navigate_chess_pieces').removeClass('active');
        });
    }

    // Callback xử lý việc di chuyển của quân cờ khi click vào mũi tên trên mỗi quân cờ khi quân cờ đc hover
    Cb_HandleMoveChessP(e) { // Cb: callback
        let direction = $(e.target).attr('data-direction');
        let chessBox = $(e.target).parents('.chess_box');
        let chessPieces = chessBox.parent().attr('data-chess-pieces');
        let chessPCoord = chessBox.parent().attr('data-chess-pieces-coord').split(',').map(Number);
        if (chessBox.parent().attr('data-chess-pieces') == 1) { // Quân đen
            if (direction == "top") {
                $(e.target).parents('.chess_box').css('transform', 'translateY(-100%)')
                this.ChessBoardUpdates(this, chessPCoord, [chessPCoord[0] - 1, chessPCoord[1]], chessPieces);
            } else if (direction == "right") {
                $(e.target).parents('.chess_box').css('transform', 'translateX(100%)');
                this.ChessBoardUpdates(this, chessPCoord, [chessPCoord[0], chessPCoord[1] + 1], chessPieces);
            } else { // bottom: downward
                $(e.target).parents('.chess_box').css('transform', 'translateY(100%)')
                this.ChessBoardUpdates(this, chessPCoord, [chessPCoord[0] + 1, chessPCoord[1]], chessPieces);
            }
        }
    }

    // Kích hoạt sự kiện click cho tất cả các mũi tên đc hiển thị trong quân cờ khi quân cờ đc hover
    TriggerClickEMoveChessP(objDodGame) {
        document.querySelectorAll('.navigate_chess_pieces').forEach(function (elem, index) {
            elem.addEventListener('click', objDodGame.Cb_HandleMoveChessP.bind(objDodGame));
        });
    }

    // Cập nhật bàn cờ
    ChessBoardUpdates(objDodGame, oldCoord, newCoord, chessPieces) {
        let newState = '';
        let size = this.numbRowCol;
        let AIPlayChess = null;

        // Xóa bỏ các sự kiện hover trên các ô cờ ở trạng thái cũ và thiết lập lại
        $('.chessBox-hover').off('hover');

        // Cập nhật lại vị trí quân cờ
        this.UpdateChessPiecesPos(size, oldCoord, newCoord, chessPieces);

        document.querySelectorAll('.chessboard__tbody td').forEach(function (chessBox, index) {
            newState += $(chessBox).attr('data-chess-pieces');
        });

        AIPlayChess = this.AlphaBeta(newState.split('').map(Number), dodgame.deep, -Infinity, Infinity, false);

        // console.log('^&^ -------------------------- ^&^')
        // console.log('Nước đi của người chơi!')
        // console.log(newState.split(''))
        // console.log('Nước đi của AI: ')
        // console.log(AIPlayChess)
        // console.log('^&^ --------------------------- ^&^')

        if (AIPlayChess.length > 0) { // AI đi quân
            if (this.IsEndState(AIPlayChess[1])) {
                if (AIPlayChess[1].findIndex((chessPieces, index) => { return chessPieces == 1 }) < 0) {
                    this.UpdateNotifiWGameEnd('./images/victory.gif', 'Thắng Cuộc');
                } else if (AIPlayChess[1].findIndex((chessPieces, index) => { return chessPieces == 2 }) < 0) {
                    this.UpdateNotifiWGameEnd('./images/loser.gif', 'Thua Cuộc');
                } else {
                    this.UpdateNotifiWGameEnd('./images/handshake.gif', 'Hòa');
                }
            }
            this.UpdateChessPiecesPos(size, AIPlayChess[2].split(',').map(Number), AIPlayChess[3].split(',').map(Number), 2);
        }

        this.initState = [...AIPlayChess[1]];
        this.TriggerEHoverOnChessBox(this, size);
    }

    // Cập nhật thông báo khi kết thúc trò chơi
    UpdateNotifiWGameEnd(image, txt) {
        $('.css-DVb7j7').css('display', 'block');
        $('.css-sG2GHL img').attr('src', image);
        $('.gr__section-text .css-jpvAVi').text(txt);
    }

    // Cập nhật lại vị trí quân cờ
    UpdateChessPiecesPos(size, oldCoord, newCoord, chessPieces) {
        let chessBoxList = document.querySelectorAll('.chessboard__tbody td');
        if (newCoord[0] < 0) {
            $(chessBoxList[oldCoord[0] * size + oldCoord[1]]).children('.chess_box').addClass('active-chessP-out-top active-chessP-out');
        } else if (newCoord[1] >= size) {
            $(chessBoxList[oldCoord[0] * size + oldCoord[1]]).children('.chess_box').addClass('active-chessP-out-right active-chessP-out');
        } else {
            $(chessBoxList[newCoord[0] * size + newCoord[1]]).html(this.GetChessPieces(chessPieces)).attr('data-chess-pieces', chessPieces);
        }
        $(chessBoxList[oldCoord[0] * size + oldCoord[1]]).html("").attr('data-chess-pieces', 0);
        // 0: quay trở về trạng thái trống
        $(chessBoxList[newCoord[0] * size + newCoord[1]]).find('.navigate_chess_pieces').click(this.Cb_HandleMoveChessP.bind(this));

    }

    // Hàm lấy html quân cờ
    GetChessPieces(chessP) {
        // chessP == true: Người chơi
        return chessP == true ? $('.css-nXr1CZ').html() : this.htmlWhiteChessP;
    }

    //PHẦN XỬ LÝ LẤY NƯỚC ĐI CỦA AI
    // Kiểm tra xem trạng thái hiện tại có phải là trạng thái kết thúc ko
    IsEndState(state) {

        let size = this.numbRowCol;
        if (state.findIndex((chessPieces, index) => { return chessPieces == 1 }) < 0) {
            return true;
        } else if (state.findIndex((chessPieces, index) => { return chessPieces == 2 }) < 0) {
            return true;
        } else if (state.filter((val, index) => { return val > 0; }).length == 3) {
            // Trạng thái bàn cờ chỉ có 3 quân cờ
            for (let row = 0; row < size; row++) {
                for (let col = 0; col < size; col++) {
                    if (state[row * size + col] != 0) {
                        if (col <= 1 && state[row * size + col] == 1 && state[row * size + col + 1] == 2) {
                            if (state[(row + 1) * size + col] == 2 && state[(row - 1) * size + col] != 0 || state[(row + 1) * size + col] != 0 && state[(row - 1) * size + col] == 2) {
                                return true;
                            }
                        } else if (row != 0 && state[row * size + col] == 2 && state[(row - 1) * size + col] == 1) {
                            if (col == 0 && state[row * size + col + 1] == 1 || col == 2 && state[row * size + col - 1] == 1) {
                                return true;
                            }
                        }
                    }
                }
            }
        }
        return false;
    }

    // Lấy giá trị của hàm đánh giá
    GetValEvalFunc(state) {
        let size = this.numbRowCol;
        let evalFuncVal = 0;
        let numb1 = 0, numb2 = 0;
        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                if (state[row * size + col] == 1) { // Người chơi
                    numb1 += 1;
                    evalFuncVal += this.blackChessPVal[row * size + col] + (col <= 1 && state[row * size + col + 1] == 2 ? 40 : 0) + (col == 0 && state[row * size + col + 2] == 2 ? 30 : 0)
                } else if (state[row * size + col] == 2) { // Máy chơi
                    numb2 += 1;
                    evalFuncVal += this.whiteChessPVal[row * size + col] + (row >= 1 && state[(row - 1) * size + col] == 1 ? -40 : 0) + (row == 2 && state[(row - 2) * size + col] == 1 ? -30 : 0)
                }

            }
        }
        evalFuncVal += (numb1 == 1 ? -85 : (numb1 == 0 ? -85 * 2 : 0)) + (numb2 == 1 ? 85 : (numb2 == 0 ? 85 * 2 : 0));
        return evalFuncVal;
    }

    // Sử dụng pp cắt cụt alpha-beta để tìm nước đi tốt nhất cho AI
    AlphaBeta(state, deep, alpha, beta, player) {
        let size = this.numbRowCol;
        let evalFuncVal = -Infinity;
        let childState = null;
        let bestMove = null;
        let minVal = -Infinity;
        let maxVal = Infinity;
        if (this.IsEndState(state) || deep == 0) {
            return [this.GetValEvalFunc(state), state];
        }
        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                if (player == true && state[row * size + col] == 1) {
                    // Người chơi
                    if (col == size - 1 && state[row * size + col] == 1) {
                        childState = [...state];
                        childState[row * size + col] = 0;

                        evalFuncVal = this.AlphaBeta(childState, deep - 1, alpha, beta, false);

                        if (evalFuncVal[0] < maxVal) {
                            maxVal = evalFuncVal[0];
                            beta = maxVal;
                            bestMove = [maxVal, childState, row + ',' + col, row + ',' + (col + 1)]
                        }

                        if (alpha >= beta) {
                            return bestMove;
                        }
                    }
                    for (let i = 0; i < size; i++) {
                        for (let j = 0; j < size; j++) {
                            if (Math.abs(row - i) == 1 && col == j && state[i * size + j] == 0 || row == i && j - col == 1 && state[i * size + j] == 0) {
                                childState = [...state];
                                childState[i * size + j] = 1;
                                childState[row * size + col] = 0;

                                evalFuncVal = this.AlphaBeta(childState, deep - 1, alpha, beta, false);

                                if (evalFuncVal[0] < maxVal) {
                                    maxVal = evalFuncVal[0];
                                    beta = maxVal;
                                    bestMove = [maxVal, childState, row + ',' + col, i + ',' + j];
                                }

                                if (alpha >= beta) {
                                    return bestMove;
                                }
                            }
                        }
                    }

                } else if (player == false && state[row * size + col] == 2) {
                    // Máy chơi
                    if (row == 0 && state[row * size + col] == 2) {
                        childState = [...state];
                        childState[row * size + col] = 0;

                        evalFuncVal = this.AlphaBeta(childState, deep - 1, alpha, beta, true);

                        if (evalFuncVal[0] > minVal) {
                            minVal = evalFuncVal[0];
                            alpha = minVal;
                            bestMove = [minVal, childState, row + ',' + col, row - 1 + ',' + col];
                        }

                        if (alpha >= beta) {
                            return bestMove;
                        }
                    }
                    for (let i = 0; i < size; i++) {
                        for (let j = 0; j < size; j++) {
                            if (Math.abs(col - j) == 1 && row == i && state[i * size + j] == 0 || row - i == 1 && col == j && state[i * size + j] == 0) {
                                childState = [...state];
                                childState[i * size + j] = 2;
                                childState[row * size + col] = 0;

                                evalFuncVal = this.AlphaBeta(childState, deep - 1, alpha, beta, true);

                                if (evalFuncVal[0] > minVal) {
                                    minVal = evalFuncVal[0];
                                    alpha = minVal;
                                    bestMove = [minVal, childState, row + ',' + col, i + ',' + j];
                                }

                                if (alpha >= beta) {
                                    return bestMove;
                                }
                            }
                        }
                    }
                }
            }
        }
        return bestMove;
    }
}

var dodgame = new Dodgame();
var stringx = "010020012";
// var state = [0, 1, 2, 1, 0, 0, 0, 2, 0];
// var state = stringx.split('').map(Number);
// var initState = [1, 0, 0, 1, 0, 0, 0, 2, 2];
dodgame.InitGame();
dodgame.ActivateMachineGoFirst(dodgame);

// dodgame.AlphaBeta(state, 1, -Infinity, Infinity, player = false)

    // console.log("Đay la gia tri cua ham danh gia: " + state.join(','))
    // console.log(dodgame.GetValEvalFunc(state));

    // console.log("Trạng thái kthuc")
    // console.log(dodgame.IsEndState(state))

    // console.log("Nước đi tốt nhất: ")
    // console.log(dodgame.AlphaBeta(state, 3, -Infinity, Infinity, true))
