import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchView } from '../modules/search/views/SearchView/SearchView';
import { selectWalletAddress } from '../modules/wallets/common/selectors/selectWalletAddress';
import { useAppSelector } from '../hooks';

export function Search() {
  const navigate = useNavigate();
  const walletAddress = useAppSelector(selectWalletAddress);
  const [initialWalletAddress] = useState(walletAddress);

  useEffect(
    () => {
      if (!walletAddress) return;
      if (initialWalletAddress) return;

      navigate(`/${walletAddress}/assets`);
    },
    [navigate, walletAddress],
  );

  return <SearchView />;
}
