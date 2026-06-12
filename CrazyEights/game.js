const suits = ["Hearts", "Diamonds", "Clubs", "Spades"];
const suitSymbols = {
  Hearts: "♥",
  Diamonds: "♦",
  Clubs: "♣",
  Spades: "♠"
};

const ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

let deck = [];
let discardPile = [];
let playerHand = [];
let computerHand = [];
let currentSuit = "";
let gameOver = false;
let waitingForSuitChoice = false;

const playerHandEl = document.getElementById("playerHand");
const discardCardEl = document.getElementById("discardCard");
const messageEl = document.getElementById("message");
const currentSuitEl = document.getElementById("currentSuit");
const computerCountEl = document.getElementById("computerCount");
const drawCardBtn = document.getElementById("drawCard");
const newGameBtn = document.getElementById("newGame");
const suitChooserEl = document.getElementById("suitChooser");

newGameBtn.addEventListener("click", startGame);
drawCardBtn.addEventListener("click", playerDrawCard);

document.querySelectorAll("#suitChooser button").forEach(button => {
  button.addEventListener("click", () => {
    chooseSuit(button.dataset.suit);
  });
});

function createDeck() {
  const newDeck = [];

  for (const suit of suits) {
    for (const rank of ranks) {
      newDeck.push({ suit, rank });
    }
  }

  return shuffle(newDeck);
}

function shuffle(cards) {
  const shuffled = [...cards];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[i]];
  }

  return shuffled;
}

function startGame() {
  deck = createDeck();
  discardPile = [];
  playerHand = [];
  computerHand = [];
  gameOver = false;
  waitingForSuitChoice = false;
  suitChooserEl.classList.add("hidden");

  for (let i = 0; i < 7; i++) {
    playerHand.push(deck.pop());
    computerHand.push(deck.pop());
  }

  let firstCard = deck.pop();

  while (firstCard.rank === "8") {
    deck.unshift(firstCard);
    deck = shuffle(deck);
    firstCard = deck.pop();
  }

  discardPile.push(firstCard);
  currentSuit = firstCard.suit;

  setMessage("Game started. Play a matching rank, matching suit, or any 8.");
  render();
}

function render() {
  playerHandEl.innerHTML = "";

  playerHand.forEach((card, index) => {
    const cardEl = document.createElement("button");
    cardEl.className = `card ${isRed(card) ? "red" : "black"}`;
    cardEl.textContent = `${card.rank} ${suitSymbols[card.suit]}`;
    cardEl.disabled = gameOver || waitingForSuitChoice;
    cardEl.addEventListener("click", () => playerPlayCard(index));
    playerHandEl.appendChild(cardEl);
  });

  const topCard = getTopDiscard();
  discardCardEl.textContent = `${topCard.rank} ${suitSymbols[topCard.suit]}`;
  discardCardEl.className = `card discard ${isRed(topCard) ? "red" : "black"}`;

  currentSuitEl.textContent = `${suitSymbols[currentSuit]} ${currentSuit}`;
  computerCountEl.textContent = computerHand.length;
}

function isRed(card) {
  return card.suit === "Hearts" || card.suit === "Diamonds";
}

function getTopDiscard() {
  return discardPile[discardPile.length - 1];
}

function isPlayable(card) {
  const topCard = getTopDiscard();

  return (
    card.rank === "8" ||
    card.suit === currentSuit ||
    card.rank === topCard.rank
  );
}

function playerPlayCard(index) {
  if (gameOver || waitingForSuitChoice) return;

  const selectedCard = playerHand[index];

  if (!isPlayable(selectedCard)) {
    setMessage("You cannot play that card. Match the suit, rank, or play an 8.");
    return;
  }

  playerHand.splice(index, 1);
  discardPile.push(selectedCard);

  if (selectedCard.rank === "8") {
    waitingForSuitChoice = true;
    suitChooserEl.classList.remove("hidden");
    setMessage("You played an 8. Choose the next suit.");
    render();
    return;
  }

  currentSuit = selectedCard.suit;

  if (checkWinner()) return;

  setMessage(`You played ${formatCard(selectedCard)}. Computer's turn...`);
  render();

  setTimeout(computerTurn, 700);
}

function chooseSuit(suit) {
  currentSuit = suit;
  waitingForSuitChoice = false;
  suitChooserEl.classList.add("hidden");

  if (checkWinner()) return;

  setMessage(`You chose ${suit}. Computer's turn...`);
  render();

  setTimeout(computerTurn, 700);
}

function playerDrawCard() {
  if (gameOver || waitingForSuitChoice) return;

  drawFromDeck(playerHand);
  setMessage("You drew a card. Computer's turn...");
  render();

  setTimeout(computerTurn, 700);
}

function computerTurn() {
  if (gameOver) return;

  let playableIndex = computerHand.findIndex(card => isPlayable(card));

  if (playableIndex === -1) {
    drawFromDeck(computerHand);
    setMessage("Computer drew a card. Your turn.");
    render();
    return;
  }

  const playedCard = computerHand.splice(playableIndex, 1)[0];
  discardPile.push(playedCard);

  if (playedCard.rank === "8") {
    currentSuit = chooseBestSuitForComputer();
    setMessage(`Computer played an 8 and changed the suit to ${currentSuit}. Your turn.`);
  } else {
    currentSuit = playedCard.suit;
    setMessage(`Computer played ${formatCard(playedCard)}. Your turn.`);
  }

  if (checkWinner()) return;

  render();
}

function drawFromDeck(hand) {
  if (deck.length === 0) {
    reshuffleDiscardPile();
  }

  if (deck.length > 0) {
    hand.push(deck.pop());
  }
}

function reshuffleDiscardPile() {
  if (discardPile.length <= 1) return;

  const topCard = discardPile.pop();
  deck = shuffle(discardPile);
  discardPile = [topCard];
}

function chooseBestSuitForComputer() {
  const suitCounts = {
    Hearts: 0,
    Diamonds: 0,
    Clubs: 0,
    Spades: 0
  };

  computerHand.forEach(card => {
    suitCounts[card.suit]++;
  });

  return Object.entries(suitCounts).sort((a, b) => b[1] - a[1])[0][0];
}

function checkWinner() {
  if (playerHand.length === 0) {
    gameOver = true;
    setMessage("You win!");
    render();
    return true;
  }

  if (computerHand.length === 0) {
    gameOver = true;
    setMessage("Computer wins!");
    render();
    return true;
  }

  return false;
}

function formatCard(card) {
  return `${card.rank} ${suitSymbols[card.suit]}`;
}

function setMessage(message) {
  messageEl.textContent = message;
}