import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import DownloadDocument from './download-document';

describe('DownloadDocument Component', () => {
  const mockHandleDownloadDocument = jest.fn();

  const defaultProps = {
    uploadedDocuments: [
      { ecmDocRefId: '123', docName: 'Document1' },
      { ecmDocRefId: '456', docName: 'Document2' },
    ],
    downloadDocument: mockHandleDownloadDocument,
    isLoading: false,
    isSubmitEnquiryPage: false,
    hasDownloadDocumentError: false,
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the component with default props', () => {
    render(<DownloadDocument {...defaultProps} />);
    expect(screen.getByTestId('SM_DOWNLOAD_DOCUMENT_TITLE_ID')).toBeInTheDocument();
    expect(screen.getByText('Document1')).toBeInTheDocument();
    expect(screen.getByText('Document2')).toBeInTheDocument();
  });

  it('calls handleDownloadDocument when a document link is clicked', () => {
    render(<DownloadDocument {...defaultProps} />);
    fireEvent.click(screen.getByText('Document1'));
    expect(mockHandleDownloadDocument).toHaveBeenCalledWith({ ecmDocRefId: '123', docName: 'Document1' });
  });

  it('displays download document error notification when hasDownloadDocumentError is true', () => {
    render(<DownloadDocument {...defaultProps} hasDownloadDocumentError={true} />);
    expect(screen.getByTestId('SM_DOWNLOAD_DOCUMENT_ERROR')).toBeInTheDocument();
  });

  it('renders disabled document link when document has an error', () => {
    render(<DownloadDocument {...defaultProps} hasDownloadDocumentError={true} />);
    const disabledLink = screen.getByText('Document1').closest('span');
    expect(disabledLink).toHaveClass('disabledDocument');
  });

  it('does not render download document title if isSubmitEnquiryPage is false and isLoading is true', () => {
    render(<DownloadDocument {...defaultProps} isSubmitEnquiryPage={true} isLoading={true} />);
    expect(screen.queryByTestId('SM_DOWNLOAD_DOCUMENT_TITLE_ID')).not.toBeInTheDocument();
  });
});
