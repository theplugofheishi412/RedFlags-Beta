// Gestion des cartes Red Flag
const CardManager = {
    // data red flags

    redFlags: [],


    // chargement des donnees
    async loadRedFlags() {
        try {
            const response = await fetch('../assets/data/redFlags.json');
            const data = await response.json();
            this.redFlags = data.redFlags;
            this.shuffleCards()
            console.log(this.redFlags)
            console.log('Cartes chargées:', this.redFlags.length);
            if(!this.redFlags.length) throw new Error('Aucune carte trouvée');
            return true;
        } catch (error) {
            console.error('Erreur de chargement des cartes:', error);
            return false;
        }
    },
    // Cartes  pour la session
    shuffledCards: [],

    //  les cartes
    shuffleCards() {
        // copie du tableau initial
        this.shuffledCards = [...this.redFlags];
        // parcourts des elements dans le sens inverse 
        for (let i = this.shuffledCards.length - 1; i > 1; i--) {
            const j = Math.floor(Math.random() * (i + 1));

            // permutation des cartes
            [this.shuffledCards[i], this.shuffledCards[j]] = [this.shuffledCards[j], this.shuffledCards[i]];
        }
        return this.shuffledCards;
    },

    // Obtenir une carte par index
    getCard(index) {
        if (index < this.shuffledCards.length) {
            return this.shuffledCards[index];
        }
        return null;
    },

    // Obtenir le nombre total de cartes
    getTotalCards() {
        return this.redFlags.length;
    }
};

CardManager.loadRedFlags();

