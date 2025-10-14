// Gestion PWA pour Red Flag Game
const PWA = {
    // Éléments DOM pour l'installation
    elements: {
        installPrompt: null,
        installButton: null,
        installBanner: null
    },

    // État de l'application
    state: {
        deferredPrompt: null,
        isInstalled: false,
        isOnline: true
    },

    // Initialiser PWA
    init() {
        console.log(' Initialisation PWA');
        
        this.createInstallBanner();
        this.bindEvents();
        this.checkInstallStatus();
        this.setupOnlineDetection();
        
        // Vérifier si l'app est en mode standalone
        this.checkDisplayMode();
    },

    // Créer la bannière d'installation
    createInstallBanner() {
        const bannerHTML = `
            <div id="install-banner" class="pwa-banner hidden">
                <div class="banner-content">
                    <div class="banner-icon">
                        <i class="fas fa-flag"></i>
                    </div>
                    <div class="banner-text">
                        <h3>Installer Red Flag Game</h3>
                        <p>Profitez d'une expérience optimale avec l'application installée</p>
                    </div>
                    <div class="banner-actions">
                        <button id="install-btn" class="btn-install">
                            <i class="fas fa-download"></i> Installer
                        </button>
                        <button id="close-banner" class="btn-close">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', bannerHTML);
        
        this.elements.installBanner = document.getElementById('install-banner');
        this.elements.installButton = document.getElementById('install-btn');
        this.elements.closeBanner = document.getElementById('close-banner');
    },

    // Lier les événements
    bindEvents() {
        // Événement d'installation
        window.addEventListener('beforeinstallprompt', (e) => {
            console.log(' Événement beforeinstallprompt déclenché');
            e.preventDefault();
            this.state.deferredPrompt = e;
            this.showInstallBanner();
        });

        // Événement d'installation réussie
        window.addEventListener('appinstalled', (e) => {
            console.log(' Application installée avec succès');
            this.state.isInstalled = true;
            this.hideInstallBanner();
            this.showInstallSuccess();
            this.state.deferredPrompt = null;
        });

        // Bouton d'installation
        if (this.elements.installButton) {
            this.elements.installButton.addEventListener('click', () => {
                this.installApp();
            });
        }

        // Fermer la bannière
        if (this.elements.closeBanner) {
            this.elements.closeBanner.addEventListener('click', () => {
                this.hideInstallBanner();
                this.setBannerDismissed();
            });
        }
    },

    // Installer l'application
    async installApp() {
        if (!this.state.deferredPrompt) {
            console.log(' Aucune invite d\'installation disponible');
            return;
        }

        try {
            console.log(' Lancement de l\'installation...');
            this.state.deferredPrompt.prompt();
            
            const { outcome } = await this.state.deferredPrompt.userChoice;
            console.log(`Résultat de l'installation: ${outcome}`);
            
            this.state.deferredPrompt = null;
            this.hideInstallBanner();
            
        } catch (error) {
            console.error(' Erreur lors de l\'installation:', error);
            this.showInstallError();
        }
    },

    // Afficher la bannière d'installation
    showInstallBanner() {
        // Vérifier si l'utilisateur a déjà refusé
        if (this.isBannerDismissed()) {
            return;
        }

        // Ne pas montrer si déjà installé ou en mode standalone
        if (this.state.isInstalled || this.isInStandaloneMode()) {
            return;
        }

        console.log(' Affichage de la bannière d\'installation');
        
        setTimeout(() => {
            this.elements.installBanner.classList.remove('hidden');
            this.elements.installBanner.classList.add('visible');
        }, 3000); // Afficher après 3 secondes
    },

    // Masquer la bannière d'installation
    hideInstallBanner() {
        this.elements.installBanner.classList.remove('visible');
        this.elements.installBanner.classList.add('hidden');
    },

    // Vérifier le statut d'installation
    checkInstallStatus() {
        // Vérifier via le display mode
        if (this.isInStandaloneMode()) {
            this.state.isInstalled = true;
            console.log(' Application en mode standalone (installée)');
        }

        // Vérifier via le matchMedia
        if (window.matchMedia('(display-mode: standalone)').matches) {
            this.state.isInstalled = true;
            console.log(' Application détectée comme installée (matchMedia)');
        }
    },

    // Vérifier le mode d'affichage
    checkDisplayMode() {
        const isStandalone = this.isInStandaloneMode();
        console.log(` Mode d'affichage: ${isStandalone ? 'Standalone' : 'Browser'}`);
        
        if (isStandalone) {
            document.documentElement.classList.add('standalone-mode');
        }
    },

    // Vérifier si en mode standalone
    isInStandaloneMode() {
        return window.navigator.standalone === true || 
               window.matchMedia('(display-mode: standalone)').matches;
    },

    // Configurer la détection de connexion
    setupOnlineDetection() {
        window.addEventListener('online', () => {
            console.log(' Connexion rétablie');
            this.state.isOnline = true;
            this.showOnlineStatus();
        });

        window.addEventListener('offline', () => {
            console.log(' Hors ligne');
            this.state.isOnline = false;
            this.showOfflineStatus();
        });

        // Vérifier l'état initial
        this.state.isOnline = navigator.onLine;
        if (!this.state.isOnline) {
            this.showOfflineStatus();
        }
    },

    // Afficher le statut en ligne
    showOnlineStatus() {
        this.showNotification('Connexion rétablie', 'success');
        
        // Mettre à jour l'interface si nécessaire
        const offlineElements = document.querySelectorAll('.offline-indicator');
        offlineElements.forEach(el => el.style.display = 'none');
    },

    // Afficher le statut hors ligne
    showOfflineStatus() {
        this.showNotification('Mode hors ligne activé', 'warning');
        
        // Afficher les indicateurs hors ligne
        this.createOfflineIndicator();
    },

    // Créer l'indicateur hors ligne
    createOfflineIndicator() {
        let indicator = document.getElementById('offline-indicator');
        
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'offline-indicator';
            indicator.className = 'offline-indicator';
            indicator.innerHTML = `
                <div class="offline-content">
                    <i class="fas fa-wifi"></i>
                    <span>Mode hors ligne</span>
                </div>
            `;
            document.body.appendChild(indicator);
        }
        
        indicator.style.display = 'block';
    },

    // Afficher une notification
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `pwa-notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
                <button class="notification-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animation d'entrée
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Fermeture automatique
        setTimeout(() => {
            this.hideNotification(notification);
        }, 3000);
        
        // Fermeture manuelle
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            this.hideNotification(notification);
        });
    },

    // Masquer une notification
    hideNotification(notification) {
        notification.classList.remove('show');
        notification.classList.add('hide');
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    },

    // Obtenir l'icône de notification
    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    },

    // Afficher le succès d'installation
    showInstallSuccess() {
        this.showNotification('Application installée avec succès!', 'success');
    },

    // Afficher l'erreur d'installation
    showInstallError() {
        this.showNotification('Erreur lors de l\'installation', 'error');
    },

    // Vérifier si la bannière a été refusée
    isBannerDismissed() {
        return localStorage.getItem('pwa-banner-dismissed') === 'true';
    },

    // Marquer la bannière comme refusée
    setBannerDismissed() {
        localStorage.setItem('pwa-banner-dismissed', 'true');
    },

    // Vérifier la compatibilité PWA
    checkCompatibility() {
        const compatibility = {
            serviceWorker: 'serviceWorker' in navigator,
            installPrompt: 'BeforeInstallPromptEvent' in window,
            standalone: 'standalone' in navigator,
            online: 'onLine' in navigator
        };

        console.log(' Compatibilité PWA:', compatibility);
        return compatibility;
    },

    // Obtenir les informations de stockage
    async getStorageInfo() {
        if (!navigator.storage) return null;

        try {
            const estimate = await navigator.storage.estimate();
            console.log(' Utilisation du stockage:', estimate);
            return estimate;
        } catch (error) {
            console.error('Erreur estimation stockage:', error);
            return null;
        }
    },

    // Nettoyer le cache
    async clearCache() {
        if (!navigator.serviceWorker) return;

        try {
            const cacheNames = await caches.keys();
            await Promise.all(
                cacheNames.map(cacheName => caches.delete(cacheName))
            );
            console.log(' Cache nettoyé');
            this.showNotification('Cache nettoyé avec succès', 'success');
        } catch (error) {
            console.error('Erreur nettoyage cache:', error);
            this.showNotification('Erreur lors du nettoyage du cache', 'error');
        }
    }
};

// Initialiser PWA quand la page est chargée
document.addEventListener('DOMContentLoaded', () => {
    PWA.init();
});

// Exposer PWA globalement pour le débogage
window.PWA = PWA;