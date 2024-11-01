`use strict`;

const FOOD_TYPES = {
	FRUIT: 0,
	VEGETABLE: 1,
	NEITHER: 2
}
const fruits = {
	type: FOOD_TYPES.FRUIT,
	emojis: ['🍇','🍈','🍉','🍊','🍋','🍌','🍍','🍎','🍏','🍐','🍑','🍒','🍓','🥝','🍅','🥥','🥑','🍆','🥒','🥜']
};
const vegetables = {
	type: FOOD_TYPES.VEGETABLE,
	emojis: ['🥔','🥕','🌽','🥦']
};
const neither = {
	type: FOOD_TYPES.NEITHER,
	emojis: ['🍄','🍞','🥐','🧀','🍩']
};
const optionalEmojis = {
	fruits: ['🌶'],
	vegetables: ['🥬','🧅','🧄'],
	neither: []
};

const templates = {
	menu: document.getElementById('menuContent'),
	game: document.getElementById('gameContent'),
	end: document.getElementById('endContent')
}

var controls = {}
var timer;

var contentContainer = document.getElementById('content');

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

var game = {
	score: 0,
	total: 0,
	gameTime: 5,
	currentType: null,
	currentEmoji: null,
	foods: [
		fruits,
		vegetables,
		neither
	],
	gameState: {
		state: 'init',
		states: {
			menu: {
				from: null,
				to: 'start'
			},
			start: {
				from: 'init',
				to: 'running'
			},
			running: {
				from: 'start',
				to: 'ending'
			},
			guess: {
				from: 'running',
				to: 'running'
			},
			ending: {
				from: 'running',
				to: 'init'
			}
		}
	},
	
	setState(state) { 
		this.gameState.state = state;
		this[this.gameState.state]();
	},
	nextState() { this.setState(this.gameState.states[this.gameState.state].to); },
	
	setEmoji() {
		this.currentType = randomInt(0,2);
		let newEmoji = this.foods[this.currentType].emojis[randomInt(0,this.foods[this.currentType].emojis.length - 1)];
		
		do {
			newEmoji = this.foods[this.currentType].emojis[randomInt(0,this.foods[this.currentType].emojis.length - 1)];
		} while (this.currentEmoji === newEmoji);
		
		this.currentEmoji = newEmoji;
		
		controls.emoji.innerText = this.currentEmoji;
	},
	
	reset() {
		this.gameTime = 5;
		this.score = 0;
		this.total = 0;
		this.currentType = null;
		this.currentEmoji = null;
		
		controls.score = this.score;
		controls.total = this.total;
		
		this.nextState();
	},
	
	init() {
		if(this.gameState.state === 'init') {
			
			// mount the menu template on initialization
			mountTemplate(contentContainer,templates.menu);
			
			// add controls to our start button, wait for start to be launched by player
			addControl('btnStart');			
			addControl('optionalEmojis');
			controls.btnStart.onclick = () => this.setState('start');
		} else {
			throw `invalid state: ${this.gameState.state}`
		}
	},
	
	start() {
		if(this.gameState.state === 'start') {	
			if(controls.optionalEmojis.checked) {
				this.foods[0].emojis = this.foods[0].emojis.concat(optionalEmojis.fruits);
				this.foods[1].emojis = this.foods[1].emojis.concat(optionalEmojis.vegetables);
				this.foods[2].emojis = this.foods[2].emojis.concat(optionalEmojis.neither);
			}
			
			// dismount the last template, and mount the game template
			mountTemplate(contentContainer,templates.game);
			
			// add the game controls
			addControl('countdown');
			addControl('emoji');
			addControl('score');
			addControl('total');
			addControl('btnFruit');
			addControl('btnNeither');
			addControl('btnVeg');
			
			// bind controls
			controls.btnFruit.onclick = () => this.guess(FOOD_TYPES.FRUIT);
			controls.btnNeither.onclick = () => this.guess(FOOD_TYPES.NEITHER);
			controls.btnVeg.onclick = () => this.guess(FOOD_TYPES.VEGETABLE);
			
			document.addEventListener('keyup', event => {
				switch (event.keyCode) {
					case 65:
						controls.btnFruit.click();
						break;
					case 83:
						controls.btnNeither.click();
						break;
					case 68:
						controls.btnVeg.click();
						break;
					default:
						break;
				}
			})
			
			// start the countdown, enable controls, set the emoji, and start running
			updateCountdownDisplay(this.gameTime);
			countdown(this.gameTime).then(value => {
				controls.btnFruit.disabled ? controls.btnFruit.disabled = false : null;
				controls.btnNeither.disabled ? controls.btnNeither.disabled = false : null;
				controls.btnVeg.disabled ? controls.btnVeg.disabled = false : null;
				
				this.setEmoji();
				
				// advance state and start running the game
				this.nextState();
			})
		} else {
			throw `invalid state: ${this.gameState.state}`
		}
	},
	
	running() {
		if(this.total >= 50) {
			this.nextState();
		} else if (this.gameState.state === 'running') {			
			if(this.total % 10 === 0 && this.total !==0) { this.gameTime--; }
			
			updateCountdownDisplay(this.gameTime);
			
			countdown(this.gameTime).then(value => {
				this.setEmoji();
			
				this.total++;
				controls.total.innerText = this.total;
				
				this.running();
			});
		} else {
			throw `invalid state: ${this.gameState.state}`
		}
	},
	
	guess(guess) {
		if(this.gameState.state === this.gameState.states.guess.from) {
			this.gameState.state = 'guess';
			
			if(this.currentType === guess) {				
				this.score++;
				controls.score.innerText = this.score;
			}
			
			this.total++;
			controls.total.innerText = this.total;
			
			clearInterval(timer);
			
			this.setEmoji();
			
			this.nextState();
		} else {
			throw `invalid state: ${this.gameState.state}`
		}
	},
	
	ending() {
		if(this.gameState.state === 'ending') {
			let display = document.getElementById('display');
			mountTemplate(display,templates.end);
			
			!controls.btnFruit.disabled ? controls.btnFruit.disabled = true : null;
			!controls.btnNeither.disabled ? controls.btnNeither.disabled = true : null;
			!controls.btnVeg.disabled ? controls.btnVeg.disabled = true : null;
			
			addControl('btnReset');
			controls.btnReset.onclick = () => this.reset();
		}
	}
}

function mountTemplate(parent,template) {
	let clone = document.importNode(template.content,true);
	
	// remove any existing templates
	while (parent.lastChild) { parent.removeChild(parent.lastChild); }
	
	parent.appendChild(clone);
}

function addControl(control) {
	this.controls[control] = document.getElementById(control);
}

function updateCountdownDisplay(time) {
	this.controls.countdown.innerText = time;
}

const countdown = (time) => {
	return new Promise((resolve,reject) => {
		this.timer = setInterval( function() {
			time--;
			updateCountdownDisplay(time);
			
			if (time <= 0) {
				clearInterval(timer);
				resolve();
			}
		}, 1000);
	});
}

game.init();