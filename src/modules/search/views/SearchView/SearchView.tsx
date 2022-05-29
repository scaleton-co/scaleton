import { Input } from 'antd';
import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Address } from 'ton';
import './SearchView.scss';

function isValidAddress(address: string) {
  try {
    Address.parse(address);
    return true;
  } catch {
    return false;
  }
}

export function SearchView() {
  const [address, setAddress] = useState('');
  const navigate = useNavigate();

  const navigateAddress = useCallback(
    (target: string) => {
      navigate(`/${target}/assets`);
    },
    [navigate],
  );

  const isValid = useMemo(
    () => isValidAddress(address),
    [address],
  );

  const handleChange = useCallback(
    (event) => setAddress(event.target.value),
    [setAddress],
  );

  const handleSearch = useCallback(
    () => {
      if (!address || !isValid) return;

      navigateAddress(address);
    },
    [navigateAddress, address, isValid],
  );

  return (
    <>
      <div className="search-view">
        <div className="search-logo">
          <img src="/scaleton.png" alt="Scaleton" />
        </div>

        <Input.Search
          placeholder="Enter address..."
          enterButton="Search"
          size="large"
          value={address}
          status={(address && !isValid) ? 'error' : undefined}
          onChange={handleChange}
          onSearch={handleSearch}
        />
      </div>
    </>
  );
}
