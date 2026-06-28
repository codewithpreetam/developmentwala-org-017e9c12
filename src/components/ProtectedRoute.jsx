import RequireAuth from './auth/RequireAuth';

/** @deprecated Use RequireAuth directly */
export default function ProtectedRoute({ children, roles }) {
  return <RequireAuth roles={roles}>{children}</RequireAuth>;
}
