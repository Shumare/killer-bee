import { jsx as _jsx } from "react/jsx-runtime";
import Navbar from '../components/Navbar';
export default function DashboardHeader() {
    return (_jsx("header", { children: _jsx(Navbar, {}) }));
}
