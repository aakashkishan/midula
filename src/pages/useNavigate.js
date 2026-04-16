// Simple navigation helper for state-based routing (no react-router)
let _navigate = null;
export function setNavigate(fn) {
    _navigate = fn;
}
export function useNavigate() {
    return (path) => {
        if (_navigate) _navigate(path);
    };
}
