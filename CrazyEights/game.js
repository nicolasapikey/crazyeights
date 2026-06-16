// ===============================
// Crazy Eights Game Logic
// ===============================

// The four suits used in a standard deck of cards.
const suits = ["Hearts", "Diamonds", "Clubs", "Spades"];

// Symbols used to display each suit visually on the cards.
const suitSymbols = {
  Hearts: "♥",
  Diamonds: "♦",
  Clubs: "♣",
  Spades: "♠"
};

// The thirteen ranks in each suit.
const ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

// These variables store the current state of the game.
// They change as cards are drawn, played, or shuffled.
let deck = [];
let discardPile = [];
let playerHand = [];
let computerHand = [];
let currentSuit = "";
let gameOver = false;
let waitingForSuitChoice = false;

// These variables connect JavaScript to elements in the HTML page.
// document.getElementById finds an HTML element by its id.
const playerHandEl = document.getElementById("playerHand");
const discardCardEl = document.getElementById("discardCard");
const messageEl = document.getElementById("message");
const currentSuitEl = document.getElementById("currentSuit");
const computerCountEl = document.getElementById("computerCount");
const drawCardBtn = document.getElementById("drawCard");
const newGameBtn = document.getElementById("newGame");
const suitChooserEl = document.getElementById("suitChooser");

// When the player clicks the New Game button, start a new game.
newGameBtn.addEventListener("click", startGame);

// When the player clicks the Draw button, draw a card.
drawCardBtn.addEventListener("click", playerDrawCard);

// Each suit choice button has a data-suit attribute in the HTML.
// This adds a click event to each button so the player can choose
// the next suit after playing an 8.
document.querySelectorAll("#suitChooser button").forEach(button => {
  button.addEventListener("click", () => {
    chooseSuit(button.dataset.suit);
  });
});

// Creates a brand-new 52-card deck.
// Each card is represented as an object with a suit and rank.
// Example: { suit: "Hearts", rank: "A" }
function createDeck() {
  const newDeck = [];

  // Loop through every suit.
  for (const suit of suits) {
    // For each suit, loop through every rank.
    for (const rank of ranks) {
      // Add that card to the deck.
      newDeck.push({ suit, rank });
    }
  }

  // Return the finished deck in shuffled order.
  return shuffle(newDeck);
}

// Randomly shuffles an array of cards using the Fisher-Yates shuffle.
// This makes sure the deck order is different each game.
function shuffle(cards) {
  const shuffled = [...cards];

  // Start at the last card and work backwards.
  for (let i = shuffled.length - 1; i > 0; i--) {
    // Pick a random card from the remaining unshuffled portion.
    const randomIndex = Math.floor(Math.random() * (i + 1));

    // Swap the current card with the randomly selected card.
    [shuffled[i], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[i]];
  }

  return shuffled;
}

// Starts a new game by resetting everything:
// deck, discard pile, player hand, computer hand, and game status.
function startGame() {
  deck = createDeck();
  discardPile = [];
  playerHand = [];
  computerHand = [];
  gameOver = false;
  waitingForSuitChoice = false;

  // Hide the suit chooser in case it was visible from a previous game.
  suitChooserEl.classList.add("hidden");

  // Deal 7 cards to the player and 7 cards to the computer.
  for (let i = 0; i < 7; i++) {
    playerHand.push(deck.pop());
    computerHand.push(deck.pop());
  }

  // Start the discard pile with one card from the deck.
  let firstCard = deck.pop();

  // Avoid starting the game with an 8 because 8s are wild cards.
  // If the first card is an 8, put it back, reshuffle, and draw again.
  while (firstCard.rank === "8") {
    deck.unshift(firstCard);
    deck = shuffle(deck);
    firstCard = deck.pop();
  }

  // Put the starting card onto the discard pile.
  discardPile.push(firstCard);

  // The current suit starts as the suit of the first discard card.
  currentSuit = firstCard.suit;

  // Show the starting message and update the screen.
  setMessage("Game started. Play a matching rank, matching suit, or any 8.");
  render();
}

// Updates everything visible on the page.
// This is called after almost every game action.
function render() {
  // Clear the current player hand from the screen.
  playerHandEl.innerHTML = "";

  // Rebuild the player's hand one card at a time.
  playerHand.forEach((card, index) => {
    // Create a button for each card.
    const cardEl = document.createElement("button");

    // Give the card styling.
    // Red cards get the red class; black cards get the black class.
    cardEl.className = `card ${isRed(card) ? "red" : "black"}`;

    // Show the card rank and suit symbol.
    cardEl.textContent = `${card.rank} ${suitSymbols[card.suit]}`;

    // Disable clicking cards if the game is over or if the player
    // still needs to choose a suit after playing an 8.
    cardEl.disabled = gameOver || waitingForSuitChoice;

    // When this card is clicked, try to play it.
    // The index tells the program which card in the hand was clicked.
    cardEl.addEventListener("click", () => playerPlayCard(index));

    // Add the card button to the page.
    playerHandEl.appendChild(cardEl);
  });

  // Get the current top card of the discard pile.
  const topCard = getTopDiscard();

  // Show the top discard card.
  discardCardEl.textContent = `${topCard.rank} ${suitSymbols[topCard.suit]}`;
  discardCardEl.className = `card discard ${isRed(topCard) ? "red" : "black"}`;

  // Show the current suit that must be matched.
  currentSuitEl.textContent = `${suitSymbols[currentSuit]} ${currentSuit}`;

  // Show how many cards the computer has.
  computerCountEl.textContent = computerHand.length;
}

// Returns true if the card is Hearts or Diamonds.
// This is used only for display color.
function isRed(card) {
  return card.suit === "Hearts" || card.suit === "Diamonds";
}

// Returns the card currently on top of the discard pile.
function getTopDiscard() {
  return discardPile[discardPile.length - 1];
}

// Checks whether a card can legally be played.
// A card is playable if:
// 1. It is an 8, because 8s are wild.
// 2. It matches the current suit.
// 3. It matches the rank of the top discard card.
function isPlayable(card) {
  const topCard = getTopDiscard();

  return (
    card.rank === "8" ||
    card.suit === currentSuit ||
    card.rank === topCard.rank
  );
}

// Handles the player clicking a card in their hand.
function playerPlayCard(index) {
  // Stop the function if the game is over or if the player
  // still needs to choose a suit.
  if (gameOver || waitingForSuitChoice) return;

  // Get the selected card from the player's hand.
  const selectedCard = playerHand[index];

  // If the selected card is not legal, show a message and stop.
  if (!isPlayable(selectedCard)) {
    setMessage("You cannot play that card. Match the suit, rank, or play an 8.");
    return;
  }

  // Remove the selected card from the player's hand.
  playerHand.splice(index, 1);

  // Add the selected card to the discard pile.
  discardPile.push(selectedCard);

  // If the player played an 8, they get to choose the next suit.
  if (selectedCard.rank === "8") {
    waitingForSuitChoice = true;
    suitChooserEl.classList.remove("hidden");
    setMessage("You played an 8. Choose the next suit.");
    render();
    return;
  }

  // If the card was not an 8, the current suit becomes that card's suit.
  currentSuit = selectedCard.suit;

  // Check if the player won by playing their last card.
  if (checkWinner()) return;

  // Show a message, update the screen, and let the computer take its turn.
  setMessage(`You played ${formatCard(selectedCard)}. Computer's turn...`);
  render();

  // Delay the computer's turn slightly so it feels more natural.
  setTimeout(computerTurn, 700);
}

// Handles the player choosing a suit after playing an 8.
function chooseSuit(suit) {
  // Set the current suit to the player's selected suit.
  currentSuit = suit;

  // The player no longer needs to choose a suit.
  waitingForSuitChoice = false;

  // Hide the suit chooser buttons.
  suitChooserEl.classList.add("hidden");

  // Check if the player won after playing the 8.
  if (checkWinner()) return;

  // Show the chosen suit, update the screen, and let the computer play.
  setMessage(`You chose ${suit}. Computer's turn...`);
  render();

  setTimeout(computerTurn, 700);
}

// Handles the player clicking the Draw button.
function playerDrawCard() {
  // Do nothing if the game is over or the player must choose a suit.
  if (gameOver || waitingForSuitChoice) return;

  // Draw one card into the player's hand.
  drawFromDeck(playerHand);

  // After drawing, the turn passes to the computer.
  setMessage("You drew a card. Computer's turn...");
  render();

  setTimeout(computerTurn, 700);
}

// Controls the computer's turn.
function computerTurn() {
  if (gameOver) return;

  // Look for the first card in the computer's hand that can be played.
  let playableIndex = computerHand.findIndex(card => isPlayable(card));

  // If the computer has no playable card, it draws one card.
  if (playableIndex === -1) {
    drawFromDeck(computerHand);
    setMessage("Computer drew a card. Your turn.");
    render();
    return;
  }

  // Remove the playable card from the computer's hand.
  const playedCard = computerHand.splice(playableIndex, 1)[0];

  // Add it to the discard pile.
  discardPile.push(playedCard);

  // If the computer plays an 8, it chooses the best suit based on
  // which suit it has the most of in its hand.
  if (playedCard.rank === "8") {
    currentSuit = chooseBestSuitForComputer();
    setMessage(`Computer played an 8 and changed the suit to ${currentSuit}. Your turn.`);
  } else {
    // Otherwise, the current suit becomes the suit of the card played.
    currentSuit = playedCard.suit;
    setMessage(`Computer played ${formatCard(playedCard)}. Your turn.`);
  }

  // Check if the computer won.
  if (checkWinner()) return;

  // Update the screen after the computer's move.
  render();
}

// Draws one card from the deck into the given hand.
// The hand can be either playerHand or computerHand.
function drawFromDeck(hand) {
  // If the deck is empty, try to reshuffle the discard pile
  // back into the deck.
  if (deck.length === 0) {
    reshuffleDiscardPile();
  }

  // If there is a card available, draw it.
  if (deck.length > 0) {
    hand.push(deck.pop());
  }
}

// When the draw deck is empty, this function turns the discard pile
// into a new shuffled deck, while keeping the top discard card in place.
function reshuffleDiscardPile() {
  // If there is only one card in the discard pile, there is nothing
  // available to reshuffle.
  if (discardPile.length <= 1) return;

  // Temporarily remove the top discard card.
  const topCard = discardPile.pop();

  // Shuffle the rest of the discard pile into a new deck.
  deck = shuffle(discardPile);

  // Put the top card back as the only card in the discard pile.
  discardPile = [topCard];
}

// Chooses the best suit for the computer after it plays an 8.
// The "best" suit is whichever suit the computer currently has the most of.
function chooseBestSuitForComputer() {
  const suitCounts = {
    Hearts: 0,
    Diamonds: 0,
    Clubs: 0,
    Spades: 0
  };

  // Count how many cards the computer has in each suit.
  computerHand.forEach(card => {
    suitCounts[card.suit]++;
  });

  // Convert the suit count object into an array, sort it from highest
  // to lowest count, then return the suit with the highest count.
  return Object.entries(suitCounts).sort((a, b) => b[1] - a[1])[0][0];
}

// Checks whether either player has won.
// A player wins when they have no cards left.
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

  // No winner yet.
  return false;
}

// Formats a card for display in messages.
// Example: "A ♥"
function formatCard(card) {
  return `${card.rank} ${suitSymbols[card.suit]}`;
}

// Updates the message shown to the player.
function setMessage(message) {
  messageEl.textContent = message;
}