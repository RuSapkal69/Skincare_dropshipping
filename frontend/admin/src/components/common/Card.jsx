// src/components/common/Card.jsx
import React from 'react';

const Card = ({ 
  children, 
  title, 
  className = '', 
  titleClassName = '',
  bodyClassName = '',
  footer,
  footerClassName = ''
}) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden ${className}`}>
      {title && (
        <div className={`px-4 py-3 border-b dark:border-gray-700 ${titleClassName}`}>
          {typeof title === 'string' ? (
            <h3 className="font-medium">{title}</h3>
          ) : (
            title
          )}
        </div>
      )}
      
      <div className={`p-4 ${bodyClassName}`}>
        {children}
      </div>
      
      {footer && (
        <div className={`px-4 py-3 border-t dark:border-gray-700 ${footerClassName}`}>
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;