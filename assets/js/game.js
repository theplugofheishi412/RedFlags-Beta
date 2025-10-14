// Gestion principale du jeu
// verifier le compteur de point et afficher le resultat a la fin
const Game = {
    // État du jeu
    state: {
        currentCardIndex: 0,
        acceptedFlags: 0,
        totalFlags: 10,
        gameStarted: false,
        isDragging: false,
        startX: 0,
        currentX: 0
    },

    // Éléments DOM
    elements: {},

    // Initialiser le jeu
    init() {
        this.cacheElements();
        this.bindEvents();
        this.resetGame();
    },

    // Mettre en cache les éléments DOM
    cacheElements() {
        this.elements = {
            startScreen: document.getElementById('start-screen'),
            gameScreen: document.getElementById('game-screen'),
            resultsScreen: document.getElementById('results-screen'),
            startBtn: document.getElementById('start-btn'),
            backBtn: document.getElementById('back-btn'),
            restartBtn: document.getElementById('restart-btn'),
            currentCard: document.getElementById('current-card'),
            cardText: document.getElementById('card-text'),
            cardNumber: document.getElementById('card-number'),
            progressText: document.getElementById('progress-text'),
            progressBar: document.getElementById('progress-bar'),
            acceptBtn: document.getElementById('accept-btn'),
            rejectBtn: document.getElementById('reject-btn'),
            scoreElement: document.getElementById('score'),
            compatibilityLevel: document.getElementById('compatibility-level'),
            resultDescription: document.getElementById('result-description'),
            acceptedCount: document.getElementById('accepted-count'),
            rejectedCount: document.getElementById('rejected-count'),
            shareTwitter: document.getElementById('share-twitter'),
            shareWhatsapp: document.getElementById('share-whatsapp'),
            shareCopy: document.getElementById('share-copy')
        };
    },

    // Lier les événements
    bindEvents() {
        // Navigation
        this.elements.startBtn.addEventListener('click', () => this.showScreen('game'));
        this.elements.backBtn.addEventListener('click', () => this.showScreen('start'));
        this.elements.restartBtn.addEventListener('click', () => this.restartGame());

        // Actions de jeu
        this.elements.acceptBtn.addEventListener('click', () => this.acceptFlag());
        this.elements.rejectBtn.addEventListener('click', () => this.rejectFlag());

        // Partage
        this.elements.shareTwitter.addEventListener('click', () => this.shareResults('twitter'));
        this.elements.shareWhatsapp.addEventListener('click', () => this.shareResults('whatsapp'));
        this.elements.shareCopy.addEventListener('click', () => this.shareResults('copy'));

        // Glissement des cartes
        this.bindSwipeEvents();
    },

    // Lier les événements de glissement
    bindSwipeEvents() {
        const card = this.elements.currentCard;
        
        card.addEventListener('mousedown', (e) => this.startDrag(e));
        card.addEventListener('touchstart', (e) => this.startDrag(e));
        
        document.addEventListener('mousemove', (e) => this.drag(e));
        document.addEventListener('touchmove', (e) => this.drag(e));
        
        document.addEventListener('mouseup', () => this.endDrag());
        document.addEventListener('touchend', () => this.endDrag());
    },

    // Gestion du glissement
    startDrag(e) {
        this.state.isDragging = true;
        this.state.startX = e.clientX || e.touches[0].clientX;
        this.elements.currentCard.style.cursor = 'grabbing';
    },

    drag(e) {
        if (!this.state.isDragging) return;
        
        this.state.currentX = e.clientX || e.touches[0].clientX;
        this.updateCardPosition();
    },

    updateCardPosition() {
        const diff = this.state.currentX - this.state.startX;
        const rotation = diff * 0.1;
        this.elements.currentCard.style.transform = `translateX(${diff}px) rotate(${rotation}deg)`;
        
        const opacity = 1 - Math.min(Math.abs(diff) / 200, 0.5);
        this.elements.currentCard.style.opacity = opacity;
    },

    endDrag() {
        if (!this.state.isDragging) return;
        
        this.state.isDragging = false;
        this.elements.currentCard.style.cursor = 'grab';
        
        const diff = this.state.currentX - this.state.startX;
        
        if (Math.abs(diff) > 100) {
            if (diff > 0) {
                this.acceptFlag();
            } else {
                this.rejectFlag();
            }
        } else {
            this.resetCardPosition();
        }
    },

    resetCardPosition() {
        this.elements.currentCard.style.transform = 'translateX(0)';
        this.elements.currentCard.style.opacity = '1';
    },

    // Réinitialiser le jeu
    resetGame() {
        this.state.currentCardIndex = 0;
        this.state.acceptedFlags = 0;
        CardManager.shuffleCards();
        this.updateProgress();
    },

    // Démarrer une nouvelle partie
    restartGame() {
        this.resetGame();
        this.showScreen('game');
        this.updateCard();
    },

    // Accepter un red flag
    acceptFlag() {
        this.state.acceptedFlags++;
        this.nextCard('right');
    },

    // Rejeter un red flag
    rejectFlag() {
        this.nextCard('left');
    },

    // Passer à la carte suivante
    nextCard(direction) {
        const card = this.elements.currentCard;
        
        if (direction === 'right') {
            card.classList.add('swipe-right');
        } else {
            card.classList.add('swipe-left');
        }
        
        setTimeout(() => {
            card.classList.remove('swipe-right', 'swipe-left');
            this.state.currentCardIndex++;
            
            if (this.state.currentCardIndex < this.state.totalFlags) {
                this.updateCard();
                this.updateProgress();
            } else {
                this.endGame();
            }
        }, 500);
    },

    // Mettre à jour la carte actuelle
    updateCard() {
        const cardData = CardManager.getCard(this.state.currentCardIndex);
        if (cardData) {
            this.elements.cardText.textContent = cardData.text;
            this.elements.cardNumber.textContent = `${this.state.currentCardIndex + 1}/${this.state.totalFlags}`;
            this.resetCardPosition();
        }
    },

    // Met a jour la progression
    updateProgress() {
        this.elements.progressText.textContent = `${this.state.currentCardIndex}/${this.state.totalFlags}`;
        this.elements.progressBar.style.width = `${(this.state.currentCardIndex / this.state.totalFlags) * 100}%`;
    },

    // Terminer le jeu
    endGame() {
        const toleranceScore = Math.round((this.state.acceptedFlags / this.state.totalFlags) * 100);
        this.displayResults(toleranceScore);
        this.showScreen('results');
        this.saveScore(toleranceScore);

    },
    
    // Afficher les résultats
    displayResults(score) {
        this.elements.scoreElement.textContent = `${score}%`;
        this.elements.acceptedCount.textContent = this.state.acceptedFlags;
        this.elements.rejectedCount.textContent = this.state.totalFlags - this.state.acceptedFlags;
        
        const { level, description } = this.calculateCompatibility(score);
        this.elements.compatibilityLevel.textContent = level;
        this.elements.resultDescription.textContent = description;
    },
    // Todo avoir le nomnbre de redflags et le nombre de green flags puis faire la faire la diff et afficher le resultat
    // Calculer la compatibilité
    calculateCompatibility(score) {
        if (score <= 20) {
            return {
                level: "Très Strict",
                description: "Vous avez des limites très claires et ne tolérez pas les comportements toxiques. C'est une qualité précieuse pour maintenir des relations saines."
            };
        } else if (score <= 40) {
            return {
                level: "Peu Tolérant",
                description: "Vous savez reconnaître les red flags et vous protégez efficacement des relations potentiellement nuisibles."
            };
        } else if (score <= 60) {
            return {
                level: "Tolérant Modéré",
                description: "Vous avez un bon équilibre entre tolérance et limites personnelles. Vous donnez sa chance à l'autre sans vous oublier."
            };
        } else if (score <= 80) {
            return {
                level: "Très Tolérant",
                description: "Vous êtes compréhensif(ve) et donnez facilement sa chance à l'autre. Attention à ne pas négliger vos propres besoins."
            };
        } 
        else {
            return {
              level: "Excessivement Tolérant",
                description: "Vous avez tendance à ignorer les signaux d'alerte,. Apprenez à poser vos limites."
            };
        }
    },

    // Sauvegarder le score
    saveScore(score) {
        const scores = JSON.parse(localStorage.getItem('redFlagScores')) || [];
        scores.push({
            score: score,
            date: new Date().toLocaleDateString('fr-FR'),
            accepted: this.state.acceptedFlags,
            total: this.state.totalFlags
        });
        
        if (scores.length > 10) {
            scores.shift();
        }
        
        localStorage.setItem('redFlagScores', JSON.stringify(scores));
    },

    // Partager les résultats
    shareResults(platform) {
        const score = this.elements.scoreElement.textContent;
        const level = this.elements.compatibilityLevel.textContent;
        const text = `J'ai obtenu un score de ${score} (${level}) au Red Flag Game ! 🚩\n\nTestez votre niveau de tolérance :`;
        
        switch (platform) {
            case 'twitter':
                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
                break;
            case 'whatsapp':
                window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                break;
            case 'copy':
                navigator.clipboard.writeText(text).then(() => {
                    alert('Résultat copié dans le presse-papier !');
                });
                break;
        }
    },

    // Changer d'écran
    showScreen(screenName) {
        // Cacher tous les écrans
        this.elements.startScreen.classList.remove('active');
        this.elements.gameScreen.classList.remove('active');
        this.elements.resultsScreen.classList.remove('active');
        
        // Afficher l'écran demandé
        switch (screenName) {
            case 'start':
                this.elements.startScreen.classList.add('active');
                break;
            case 'game':
                this.elements.gameScreen.classList.add('active');
                this.updateCard();
                break;
            case 'results':
                this.elements.resultsScreen.classList.add('active');
                break;
        }
    }
};