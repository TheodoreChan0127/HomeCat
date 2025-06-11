import React from 'react';
import { Typography } from 'antd';

interface PageTitleProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
}

const PageTitle: React.FC<PageTitleProps> = ({ title, subtitle, icon }) => {
  return (
    <div className="mb-8">
      <div 
        className="p-6 rounded-2xl mb-4"
        style={{
          background: 'rgb(255, 255, 255)'
        }}
      >
        <div className="flex items-center gap-4">
          {icon && (
            <div 
              className="p-3 rounded-xl"
              style={{
                background: 'rgb(255, 255, 255)'
              }}
            >
              {/* <div className="text-white text-2xl">
                {icon}
              </div> */}
            </div>
          )}
          <div>
            <Typography.Title 
              level={2} 
              style={{ 
                margin: 0,
                fontWeight: 600,
                fontSize: '28px',
                color: '#1a1a1a',
                letterSpacing: '-0.5px'
              }}
            >
              {title}
            </Typography.Title>
            {subtitle && (
              <Typography.Text 
                style={{ 
                  fontSize: '15px',
                  color: '#666',
                  display: 'block',
                  marginTop: '4px',
                  fontWeight: 400,
                  letterSpacing: '0.2px'
                }}
              >
                {subtitle}
              </Typography.Text>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageTitle; 