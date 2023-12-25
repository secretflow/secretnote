import { Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router';
import styled from 'styled-components';

const NavbarLabel = styled.span`
  font-weight: 600;
  text-transform: uppercase;
  color: inherit;
`;

const NavbarMenu = styled(Menu)`
  padding: 0;
`;

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <NavbarMenu
      mode="horizontal"
      items={[
        { key: '/graph', label: <NavbarLabel>Dependency Graph</NavbarLabel> },
        // { key: '/timeline', label: <NavbarLabel>Timeline</NavbarLabel> },
        // { key: '/transactions', label: <NavbarLabel>Transactions</NavbarLabel> },
      ]}
      selectedKeys={[location.pathname]}
      onSelect={({ key }) => navigate(key)}
    />
  );
}
