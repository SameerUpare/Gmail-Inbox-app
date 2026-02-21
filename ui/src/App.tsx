import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Senders from './pages/Senders';
import SenderDetail from './pages/SenderDetail';
import Plans from './pages/Plans';
import AuditLogs from './pages/AuditLogs';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="senders" element={<Senders />} />
          <Route path="senders/:id" element={<SenderDetail />} />
          <Route path="plans" element={<Plans />} />
          <Route path="audit" element={<AuditLogs />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
