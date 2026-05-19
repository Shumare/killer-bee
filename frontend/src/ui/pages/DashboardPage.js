import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useAuthStore } from '../../store/auth.store';
import { useRouter } from '../../store/router.store';
import useLogout from '../../hooks/useLogout';
import FreezebePage from './FreezebePage';
import IngredientPage from './IngredientPage';
import ProcessPage from './ProcessPage';
import ProfilePage from './ProfilePage';
const navItems = [
    { label: 'Accueil', page: 'dashboard', allowedRoles: ['guest', 'user', 'admin'] },
    { label: 'Modèles Freezbe', page: 'freezbe', allowedRoles: ['user', 'admin'] },
    { label: 'Ingrédients', page: 'ingredients', allowedRoles: ['user', 'admin'] },
    { label: 'Procédés', page: 'processes', allowedRoles: ['user', 'admin'] },
    { label: 'Profil', page: 'profile', allowedRoles: ['user', 'admin'] },
];
export default function DashboardPage() {
    const { user } = useAuthStore();
    const { logout, isLoading: loggingOut } = useLogout();
    const { currentPage, navigate } = useRouter();
    return (_jsx("div", { className: "app-shell", children: _jsxs("div", { className: "page-shell", children: [_jsxs("header", { className: "page-header", children: [_jsxs("div", { children: [_jsx("p", { className: "badge", children: "Killer Bee" }), _jsx("h1", { children: "Killer Bee" }), _jsx("p", { className: "page-description", children: "Tableau de bord : clair, rapide et puissant." })] }), _jsxs("div", { className: "header-actions", children: [_jsxs("span", { className: "badge", children: ["Bonjour, ", user?.name] }), _jsx("button", { className: "button-secondary", onClick: logout, disabled: loggingOut, children: loggingOut ? 'Déconnexion...' : 'Se déconnecter' })] })] }), _jsx("nav", { className: "nav-bar", children: navItems.map(({ label, page }) => (_jsx("button", { type: "button", onClick: () => navigate(page), className: `nav-button ${currentPage === page ? 'active' : ''}`, children: label }, page))) }), _jsxs("main", { className: "main-content", children: [currentPage === 'dashboard' && _jsx(DashboardOverview, { navigate: navigate }), currentPage === 'freezbe' && _jsx(FreezebePage, {}), currentPage === 'ingredients' && _jsx(IngredientPage, {}), currentPage === 'processes' && _jsx(ProcessPage, {}), currentPage === 'profile' && _jsx(ProfilePage, {})] })] }) }));
}
function DashboardOverview({ navigate }) {
    return (_jsxs("section", { children: [_jsx("h2", { className: "page-title", children: "Bienvenue" }), _jsx("p", { className: "page-description", children: "Pr\u00EAt \u00E0 g\u00E9rer les mod\u00E8les, ingr\u00E9dients et proc\u00E9d\u00E9s." }), _jsx("div", { className: "section-grid", children: [
                    { page: 'freezbe', label: 'Modèles Freezbe', desc: 'Gère les recettes, prix, gammes et rattachements.' },
                    { page: 'ingredients', label: 'Ingrédients', desc: 'Ajoute, modifie et consulte la liste des ingrédients.' },
                    { page: 'processes', label: 'Procédés', desc: 'Crée des flux de fabrication complets et structurés.' },
                ].map(({ page, label, desc }) => (_jsxs("div", { className: "section-card", onClick: () => navigate(page), children: [_jsx("strong", { children: label }), _jsx("p", { children: desc })] }, page))) })] }));
}
