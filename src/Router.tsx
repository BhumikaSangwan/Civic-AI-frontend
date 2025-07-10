import { Route, Navigate, Routes } from "react-router";
import Login from "./pages/Login.tsx";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin.tsx"
import ProtectedRoute from "./components/ProtectRoute";
import RedirectByRole from "./components/RedirectByRole/index.tsx";
import RoleProtectedRoute from "./components/RoleProtectedRoute.tsx/index.tsx";
import Requests from "./pages/Requests";
import RequestPage from "./pages/Request"
import ReportPage from "./pages/Report"
import DocumentPage from "./pages/Document";
import Users from "./pages/Users.tsx";
// import Analysis from "./pages/Analysis";
// import RequestAnalysis from "./pages/RequestAnalysis";
import { roles } from "./libs/constants.ts"

export function Router() {
	return (
		<Routes>
			<Route path="/login" element={<Login />} />

			<Route path="/" element={<Dashboard />}>
				<Route path="" element={<Navigate to="/dashboard" />} />
				<Route path="/dashboard" element={<ProtectedRoute />}>
					<Route index element={<RedirectByRole />} />

					<Route element={<RoleProtectedRoute allowedRoles={[roles.user, roles.admin]} />}>
						<Route path="requests" element={<Requests />} />
						<Route
								path="request/:id"
								element={<RequestPage />}
							/>
						<Route 
								path="document/:id/:docId" 
								element={<DocumentPage />}
							/>
						<Route 
								path="report/:id"
								element={<ReportPage />}
							/>
					</Route>

					<Route element={<RoleProtectedRoute allowedRoles={[roles.admin]} />}>
						<Route path="users" element={<Users />} />
					</Route>
				</Route>
			</Route>
		</Routes>
	);
}
