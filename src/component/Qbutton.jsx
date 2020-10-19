import React from 'react';

function Qbutton({ content, isDisabled }) {
  return (
  <button type="button" className="que-btn" disabled={isDisabled} >{content}</button>
  )
}

export default Qbutton;