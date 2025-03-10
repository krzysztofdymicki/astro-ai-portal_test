import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import ProfilePage from '../app/dashboard/profile/page';
import { useUser } from '../contexts/UserContext';
import { RELATIONSHIP_STATUS_OPTIONS } from '../types/profile';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/contexts/UserContext', () => ({
  useUser: jest.fn(),
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('@/utils/supabase/client', () => ({
  createClient: jest.fn(),
}));

// Mock for Link component
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, className, children }: any) => (
    <a href={href} className={className} data-testid="mock-link">
      {children}
    </a>
  ),
}));

describe('ProfilePage Component', () => {
  // Router mock setup
  const pushMock = jest.fn();
  
  // Default user profile data
  const defaultProfile = {
    first_name: 'Test',
    last_name: 'User',
    birth_date: '1990-01-01',
    birth_time: '12:00',
    birth_location: 'Warszawa, Polska',
    current_location: 'Kraków, Polska',
    relationship_status: 'single',
  };
  
  // User context mock with different states
  const mockInitialLoading = {
    profile: null,
    loading: { initial: true, profile: true },
    updateProfile: jest.fn(),
    refreshUserData: jest.fn(),
  };
  
  const mockWithProfile = {
    profile: defaultProfile,
    loading: { initial: false, profile: false },
    updateProfile: jest.fn(),
    refreshUserData: jest.fn(),
  };
  
  const mockUpdating = {
    profile: defaultProfile,
    loading: { initial: false, profile: true },
    updateProfile: jest.fn(),
    refreshUserData: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: pushMock });
  });

  test('renders loading spinner when in initial loading state', () => {
    (useUser as jest.Mock).mockReturnValue(mockInitialLoading);
    
    render(<ProfilePage />);
    
    expect(screen.getByTestId('profile-loading-spinner')).toBeInTheDocument();
    expect(screen.queryByTestId('profile-form')).not.toBeInTheDocument();
  });

  test('renders form with user data when profile is loaded', () => {
    (useUser as jest.Mock).mockReturnValue(mockWithProfile);
    
    render(<ProfilePage />);
    
    expect(screen.queryByTestId('profile-loading-spinner')).not.toBeInTheDocument();
    expect(screen.getByTestId('profile-form')).toBeInTheDocument();
    
    // Check if profile data is properly displayed
    expect(screen.getByTestId('first-name-input')).toHaveValue('Test');
    expect(screen.getByLabelText(/nazwisko/i)).toHaveValue('User');
    expect(screen.getByLabelText(/data urodzenia/i)).toHaveValue('1990-01-01');
  });

  test('updates form fields when user inputs data', async () => {
    (useUser as jest.Mock).mockReturnValue(mockWithProfile);
    
    render(<ProfilePage />);
    
    // Get form fields
    const firstNameInput = screen.getByTestId('first-name-input');
    const lastNameInput = screen.getByLabelText(/nazwisko/i);
    
    // Change input values
    await userEvent.clear(firstNameInput);
    await userEvent.type(firstNameInput, 'Nowe');
    
    await userEvent.clear(lastNameInput);
    await userEvent.type(lastNameInput, 'Nazwisko');
    
    // Check if values updated
    expect(firstNameInput).toHaveValue('Nowe');
    expect(lastNameInput).toHaveValue('Nazwisko');
  });

  test('submits form and shows success message on successful update', async () => {
    const updateProfileMock = jest.fn().mockResolvedValue({});
    (useUser as jest.Mock).mockReturnValue({
      ...mockWithProfile,
      updateProfile: updateProfileMock
    });
    
    render(<ProfilePage />);
    
    // Submit form
    const saveButton = screen.getByTestId('save-profile-button');
    fireEvent.click(saveButton);
    
    // Check if updateProfile was called
    await waitFor(() => {
      expect(updateProfileMock).toHaveBeenCalledWith({
        ...defaultProfile
      });
    });
    
    // Check if success toast was shown
    expect(toast.success).toHaveBeenCalledWith(
      expect.stringContaining('Profil został zaktualizowany')
    );
  });

  test('shows error message when profile update fails', async () => {
    const updateProfileMock = jest.fn().mockRejectedValue(new Error('Update failed'));
    (useUser as jest.Mock).mockReturnValue({
      ...mockWithProfile,
      updateProfile: updateProfileMock
    });
    
    render(<ProfilePage />);
    
    // Submit form
    const saveButton = screen.getByTestId('save-profile-button');
    fireEvent.click(saveButton);
    
    // Check if error toast was shown
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining('Wystąpił błąd')
      );
    });
  });

  test('disables save button during form submission', async () => {
    // Mock a slow profile update function
    const slowUpdateMock = jest.fn().mockImplementation(() => {
      return new Promise(resolve => setTimeout(resolve, 100));
    });
    
    (useUser as jest.Mock).mockReturnValue({
      ...mockWithProfile,
      updateProfile: slowUpdateMock
    });
    
    render(<ProfilePage />);
    
    // Submit form
    const saveButton = screen.getByTestId('save-profile-button');
    fireEvent.click(saveButton);
    
    // Button should be disabled during submission
    expect(saveButton).toBeDisabled();
    
    // Wait for the update to complete
    await waitFor(() => {
      expect(slowUpdateMock).toHaveBeenCalled();
    });
  });

  test('shows spinner during form submission', async () => {
    // Mock a slow profile update function
    const slowUpdateMock = jest.fn().mockImplementation(() => {
      return new Promise(resolve => setTimeout(resolve, 100));
    });
    
    (useUser as jest.Mock).mockReturnValue({
      ...mockWithProfile,
      updateProfile: slowUpdateMock
    });
    
    render(<ProfilePage />);
    
    // Submit form
    const saveButton = screen.getByTestId('save-profile-button');
    fireEvent.click(saveButton);
    
    // Should show loading spinner
    expect(screen.getByTestId('saving-spinner')).toBeInTheDocument();
    
    // Wait for the update to complete
    await waitFor(() => {
      expect(slowUpdateMock).toHaveBeenCalled();
    });
  });

  test('links back to dashboard page', () => {
    (useUser as jest.Mock).mockReturnValue(mockWithProfile);
    
    render(<ProfilePage />);
    
    const backLink = screen.getByTestId('mock-link');
    expect(backLink).toHaveAttribute('href', '/dashboard');
  });

  test('renders page title correctly', () => {
    (useUser as jest.Mock).mockReturnValue(mockWithProfile);
    
    render(<ProfilePage />);
    
    expect(screen.getByTestId('profile-title')).toHaveTextContent('Twój profil astralny');
  });

  // Additional test for the relationship status select
  test('selects relationship status correctly', async () => {
    (useUser as jest.Mock).mockReturnValue(mockWithProfile);
    
    render(<ProfilePage />);
    
    // Find the select element (shadcn UI uses a custom implementation)
    // For this test, we might need to make things more testable by adding data-testid
    const selectTrigger = screen.getByText(
      RELATIONSHIP_STATUS_OPTIONS.find(o => o.value === 'single')?.label || 'single'
    );
    
    // Open the select dropdown
    fireEvent.click(selectTrigger);
    
    // Find and select a new option (assuming "married" is an option)
    const marriedOption = screen.getByText(
      RELATIONSHIP_STATUS_OPTIONS.find(o => o.value === 'married')?.label || 'married'
    );
    fireEvent.click(marriedOption);
    
    // Submit form
    const saveButton = screen.getByTestId('save-profile-button');
    fireEvent.click(saveButton);
    
    // Check that updateProfile was called with the new relationship status
    await waitFor(() => {
      expect(mockWithProfile.updateProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          relationship_status: 'married'
        })
      );
    });
  });
});