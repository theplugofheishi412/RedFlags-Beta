// Application principale
const App = {
    // Initialiser l'application
    init() {
        console.log(' Red Flag Game - Initialisation');
        
        // Initialiser le jeu
        Game.init();
        

       
        //  la compatibilité PWA
        if ('serviceWorker' in navigator) {
            this.registerServiceWorker();
        }
        
        // Verifier le theme 
        this.detectColorScheme();
        
        console.log('Red Flag Game - Prêt');
    },

    // Enregistrer le Service Worker
    registerServiceWorker() {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log(' Service Worker enregistré:', registration);
            })
            .catch(error => {
                console.log(' Erreur Service Worker:', error);
            });
    },

    // Détecter le thème de couleur
    detectColorScheme() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
            document.documentElement.style.setProperty('--light', '#1a1a1a');
            document.documentElement.style.setProperty('--dark', '#f5f5f5');
        }
    }
};

// Démarrer l'application lorsque la page est chargée
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// Gérer les erreurs globales
window.addEventListener('error', (e) => {
    console.error(' Erreur globale:', e.error);
});