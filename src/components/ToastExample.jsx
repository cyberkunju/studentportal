/**
 * Toast Component Usage Example
 * 
 * This file demonstrates how to use the Toast notification system.
 * You can delete this file after understanding the usage.
 */

import { useToastContext } from '../contexts/ToastContext';
import Button from './Button';

const ToastExample = () => {
  const toast = useToastContext();

  return (
    <div className="p-8 space-y-4">
      <h2 className="text-2xl font-bold mb-4">Toast Notification Examples</h2>
      
      <div className="flex flex-wrap gap-3">
        <Button
          variant="primary"
          onClick={() => toast.success('Operation completed successfully!')}
        >
          Show Success Toast
        </Button>

        <Button
          variant="secondary"
          onClick={() => toast.error('An error occurred. Please try again.')}
        >
          Show Error Toast
        </Button>

        <Button
          variant="ghost"
          onClick={() => toast.warning('This action requires your attention.')}
        >
          Show Warning Toast
        </Button>

        <Button
          variant="primary"
          onClick={() => toast.info('Here is some helpful information.')}
        >
          Show Info Toast
        </Button>

        <Button
          variant="secondary"
          onClick={() => {
            toast.success('First notification');
            setTimeout(() => toast.info('Second notification'), 500);
            setTimeout(() => toast.warning('Third notification'), 1000);
          }}
        >
          Show Multiple Toasts
        </Button>

        <Button
          variant="ghost"
          onClick={() => toast.success('This will stay for 10 seconds', 10000)}
        >
          Custom Duration (10s)
        </Button>
      </div>

      <div className="mt-8 p-4 bg-white/10 dark:bg-gray-800/10 rounded-lg backdrop-blur-lg">
        <h3 className="font-semibold mb-2">Usage in your components:</h3>
        <pre className="text-sm bg-black/20 p-3 rounded overflow-x-auto">
{`import { useToastContext } from '../contexts/ToastContext';

function MyComponent() {
  const toast = useToastContext();
  
  const handleAction = () => {
    // Show success toast
    toast.success('Action completed!');
    
    // Show error toast
    toast.error('Something went wrong!');
    
    // Show warning toast
    toast.warning('Please be careful!');
    
    // Show info toast
    toast.info('Did you know?');
    
    // Custom duration (in milliseconds)
    toast.success('Custom duration', 5000);
  };
  
  return <button onClick={handleAction}>Click me</button>;
}`}
        </pre>
      </div>
    </div>
  );
};

export default ToastExample;
