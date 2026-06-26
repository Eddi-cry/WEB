type ReportsViewerProps = {
  src: string;
};

function ReportsViewer({ src }: ReportsViewerProps) {
  return (
    <div className='reports-page__viewer-container'>
      <iframe
        className='reports-page__viewer'
        src={src}
        title='Отчет о полноте данных'
        width='70%'
        height='600'
      ></iframe>
    </div>
  );
}

export default ReportsViewer;
