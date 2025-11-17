const AppStorage = {

    init: function() {
        if (!localStorage.getItem('usersInitialized')) {
            localStorage.setItem('restaurantUsers', JSON.stringify([]));
            localStorage.setItem('usersInitialized', 'true');
        }
    },

    saveUserData: function(data) {
        const userData = {
            ...data,
            registroCompleto: true,
            registroFecha: new Date().toISOString()
        };
        localStorage.setItem('currentUser', JSON.stringify(userData));
        sessionStorage.setItem('sessionActive', 'true');
    },
    
    getCurrentUser: function() {
        const data = localStorage.getItem('currentUser');
        return data ? JSON.parse(data) : null;
    },
    
    clearData: function() {
        localStorage.removeItem('currentUser');
        sessionStorage.removeItem('sessionActive');
    },
    
    isLoggedIn: function() {
        return sessionStorage.getItem('sessionActive') === 'true';
    },

    getAllUsers: function() {
        this.init(); 
        const users = localStorage.getItem('restaurantUsers');
        return users ? JSON.parse(users) : [];
    },
    
    saveNewUser: function(userData) {
        const users = this.getAllUsers();
        const newEmail = userData.email.toLowerCase().trim();
        
        const userExists = users.some(user => 
            user.email.toLowerCase().trim() === newEmail || 
            user.telefono === userData.telefono
        );
        
        if (!userExists) {
            users.push({
                ...userData,
                email: newEmail 
            });
            localStorage.setItem('restaurantUsers', JSON.stringify(users));
            return true;
        }
        return false;
    },
    
    findUser: function(identifier, password) {
        const users = this.getAllUsers();
        identifier = identifier.toLowerCase().trim();
        
        return users.find(user => {
            const emailMatch = user.email.toLowerCase().trim() === identifier;
            const phoneMatch = user.telefono === identifier;
            const passMatch = user.password === password;
            
            return (emailMatch || phoneMatch) && passMatch;
        });
    },

    getThemePreference: function() {
        return localStorage.getItem('theme') || 
               (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    },
    
    setTheme: function(theme) {
        localStorage.setItem('theme', theme);
    }
};

AppStorage.init();