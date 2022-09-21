import {
  Model,
  InferAttributes,
  InferCreationAttributes,
  ForeignKey,
  CreationOptional,
  DataTypes,
} from 'sequelize';
import { Group } from './Group';
import { User } from './user';

enum PROPOSAL_TYPES {
  ADD_PARTICIPANT = 'add participant',
  REMOVE_PARTICIPANT = 'remove participant',
  TRANSFER_FUNDS = 'transfer ethers',
  CONTRACT_INTERACTION = 'contract interaction',
  CUSTOM_TRANSACTION = 'custom transaction',
}

enum PROPOSAL_STATUSES {
  VOTING = 'voting',
  EXECUTED = 'executed',
}

class Proposal extends Model<
  InferAttributes<Proposal>,
  InferCreationAttributes<Proposal>
> {
  declare id: CreationOptional<number>;
  declare type: PROPOSAL_TYPES;
  declare descriprion?: CreationOptional<string>;
  declare address?: CreationOptional<string>;
  declare userId?: CreationOptional<number>;
  declare transferTo?: CreationOptional<string>;
  declare amountOfFunds?: CreationOptional<string>;
  declare byteCode?: CreationOptional<string>;
  declare dateCreated: number;
  declare existanceTimeInDays?: CreationOptional<number>;
  declare isDeployed: boolean;
  declare safeTxHash: string;
  declare nonce: number;
  declare status: PROPOSAL_STATUSES;
  declare threshold?: CreationOptional<number>;
  declare tokenSymbol?: CreationOptional<string>;

  declare creatorId: ForeignKey<User['id']>;
  declare groupId: ForeignKey<Group['id']>;

  declare getGroup: () => Promise<Group>;
  declare getUser: () => Promise<User>;
}

function initProposal(dataProvider) {
  Proposal.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      type: {
        type: DataTypes.STRING,
      },
      descriprion: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      address: {
        type: DataTypes.STRING,
      },
      userId: {
        type: DataTypes.INTEGER,
      },
      transferTo: {
        type: DataTypes.STRING,
      },
      amountOfFunds: {
        type: DataTypes.STRING,
      },
      byteCode: {
        type: DataTypes.STRING,
      },
      dateCreated: {
        type: DataTypes.BIGINT,
      },
      existanceTimeInDays: {
        type: DataTypes.INTEGER,
      },
      isDeployed: {
        type: DataTypes.BOOLEAN,
      },
      safeTxHash: {
        type: DataTypes.STRING,
      },
      nonce: {
        type: DataTypes.INTEGER,
      },
      status: {
        type: DataTypes.STRING,
      },
      threshold: {
        type: DataTypes.INTEGER,
      },
      creatorId: {
        type: DataTypes.INTEGER,
      },
      groupId: {
        type: DataTypes.INTEGER,
      },
      tokenSymbol: {
        type: DataTypes.STRING,
      },
    },
    {
      sequelize: dataProvider,
      tableName: 'proposals',
    },
  );
}

function setProposalRelations() {
  Proposal.belongsTo(User, {
    foreignKey: {
      name: 'creatorId',
    },
  });

  Proposal.belongsTo(Group, {
    foreignKey: {
      name: 'groupId',
    },
  });
}

export {
  PROPOSAL_TYPES,
  PROPOSAL_STATUSES,
  Proposal,
  initProposal,
  setProposalRelations,
};
