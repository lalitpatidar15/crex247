
import AdminDashboard from "./Admindashboard";
export default function AdminPage({ version }: { version: string }) {
  return <AdminDashboard version={version} />;
}
