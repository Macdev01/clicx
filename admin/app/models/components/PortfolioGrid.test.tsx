import { render, screen, fireEvent } from '@testing-library/react';
import PortfolioGrid from './PortfolioGrid';

describe('PortfolioGrid', () => {
  it('renders items and action buttons', () => {
    const items = [
      { id: 1, type: 'photo', title: 'Photo 1', url: '/photo1.jpg' },
      { id: 2, type: 'video', title: 'Video 1', url: '/video1.mp4' },
    ];
    const onEdit = jest.fn();
    const onDelete = jest.fn();
    const onPreview = jest.fn();
    render(
      <PortfolioGrid items={items} onEdit={onEdit} onDelete={onDelete} onPreview={onPreview} />
    );
    expect(screen.getByText('Photo 1')).toBeInTheDocument();
    expect(screen.getByText('Video 1')).toBeInTheDocument();
    fireEvent.click(screen.getAllByText('Edit')[0]);
    expect(onEdit).toHaveBeenCalled();
    fireEvent.click(screen.getAllByText('Delete')[1]);
    expect(onDelete).toHaveBeenCalled();
    fireEvent.click(screen.getAllByText('Preview')[0]);
    expect(onPreview).toHaveBeenCalled();
  });
}); 