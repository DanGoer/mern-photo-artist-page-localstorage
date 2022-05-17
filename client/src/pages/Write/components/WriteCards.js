// WriteCards component for Write

import { write } from "../../../assets/data";

import { Link } from "react-router-dom";

function WriteCards() {
  return (
    <div className="flex flex-col md:flex-row gap-4 md:px-4 mt-6">
      {write.map((card) => {
        return (
          <Link
            to={card.url}
            key={card.id}
            className="card-setup text-center gap-6 py-6 transition-all hover:scale-105 duration-500"
          >
            <h4 className="">{card.title}</h4>
            <p className="">{card.text}</p>
            <img className="" src={card.icon} alt={card.title} />
          </Link>
        );
      })}
    </div>
  );
}

export default WriteCards;
