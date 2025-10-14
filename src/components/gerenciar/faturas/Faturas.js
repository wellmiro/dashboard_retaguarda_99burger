import React from 'react';
import Header from './header/Header';
import Cards from './cards/Cards';
import Lista from './lista/Lista';
import './Styles.css';

const Faturas = () => {
  return (
    <div className="faturas-container">
      <Header />
      <Cards />
      <Lista />
    </div>
  );
};

export default Faturas;
