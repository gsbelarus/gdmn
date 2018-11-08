import React, { Component } from 'react';

const styles = {
  list: {
    display: 'flex',
    listStyleType: 'none'
  },
  image: {
    margin: '0.5rem',
    maxHeight: '10rem'
  }
};

interface IImageFieldProps {
  style?: object;
  data: object | string | string[];
  getSrc: (data: object | string) => string | string[];
  getTitle: (data: object | string) => string;
}

class ImageField extends Component<IImageFieldProps, any> {
  // TODO pure

  public static defaultProps = {
    style: {}, // TODO css modules
    getSrc: (data: object | string) => (typeof data === 'string' ? data : ''),
    getTitle: (data: object | string) => (typeof data === 'string' ? data : '')
  };

  public render(): JSX.Element {
    const { getSrc, getTitle, data, style } = this.props;

    const srcValue = getSrc(data);
    if (!srcValue) return <div />;

    if (Array.isArray(srcValue)) {
      return (
        <ul
          style={{
            ...styles.list,
            ...style
          }}
        >
          {srcValue.map((src, index) => {
            const title = getTitle(src);

            return (
              <li key={index}>
                <img alt={title} title={title} src={src} style={styles.image} />
              </li>
            );
          })}
        </ul>
      );
    }

    const titleValue = getTitle(data);
    // TODO CardMedia
    return (
      <div style={style}>
        <img title={titleValue} alt={titleValue} src={srcValue} style={styles.image} />
      </div>
    );
  } // todo React.Fragment
}

export { ImageField, IImageFieldProps };
