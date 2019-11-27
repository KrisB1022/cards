import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import { css } from "emotion";

import {
  Button,
  Card as ReactStrapCard,
  CardHeader,
  CardBody,
  CardImg,
  CardText
} from "reactstrap";

const imageStyles = css`
  max-width: 200px;
`;

class Card extends PureComponent {
  cardTextMarkup = ({ label, text }) => {
    return (
      <CardText>
        <span className="font-weight-bolder">{`${label}:`}</span> {text}
      </CardText>
    );
  };

  addToUserCards = () => {
    const { card, updateUserCards } = this.props;
    updateUserCards({ card });
  };

  removeFromUserCards = () => {
    const { card, updateUserCards } = this.props;
    updateUserCards({ card, remove: true });
  };

  render() {
    const { card, isUserCard } = this.props;
    const { imageUrl, name, set, text } = card;

    return (
      <div className="col-md-3 flex-grow-1 mb-4">
        <ReactStrapCard className="pl-0 pr-0 h-100">
          <CardHeader>{name}</CardHeader>

          <CardBody className="d-flex flex-column">
            <figure className="figure mx-auto d-block mb-auto border-bottom pb-2">
              <CardImg
                top
                className={`mx-auto d-block figure-img img-fluid ${imageStyles} flex-grow-1`}
                src={imageUrl}
                alt={`${name} card image`}
              />
              <figcaption className="figure-caption text-right">
                {name}
              </figcaption>
            </figure>

            <div className="pt-2 pb-2">
              {text &&
                this.cardTextMarkup({
                  label: "Card info",
                  text
                })}

              {set &&
                this.cardTextMarkup({
                  label: "Set Name",
                  text: set.name
                })}
            </div>

            {isUserCard ? (
              <Button color="secondary" onClick={this.removeFromUserCards}>
                Remove from my cards
              </Button>
            ) : (
              <Button color="primary" onClick={this.addToUserCards}>
                Add to my cards
              </Button>
            )}
          </CardBody>
        </ReactStrapCard>
      </div>
    );
  }
}

Card.propTypes = {
  card: PropTypes.object.isRequired,
  isUserCard: PropTypes.bool
};

Card.defaultProps = {
  imageUrl: "https://via.placeholder.com/223x310.png"
};

export default Card;
