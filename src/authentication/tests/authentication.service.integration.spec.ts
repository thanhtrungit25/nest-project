import { JwtService } from '@nestjs/jwt';
import User from '../../users/user.entity';
import { UsersService } from '../../users/users.service';
import { AuthenticationService } from '../authentication.service';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import mockedConfigService from '../../utils/mocks/config.service';
import mockedJwtService from '../../utils/mocks/jwt.service';
import * as bcrypt from 'bcrypt';
import mockedUser from './user.mock';

jest.mock('bcrypt');

describe('The AuthenticationService', () => {
  let authenticationService: AuthenticationService;
  // let usersService: UsersService;
  let userData: User;
  let bcryptCompare: jest.Mock;
  let findUser: jest.Mock;
  beforeEach(async () => {
    bcryptCompare = jest.fn().mockReturnValue(true);
    (bcrypt.compare as jest.Mock) = bcryptCompare;

    userData = {
      ...mockedUser,
    };
    findUser = jest.fn().mockResolvedValue(userData);
    const userRepository = {
      findOne: findUser,
    };
    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        AuthenticationService,
        {
          provide: ConfigService,
          useValue: mockedConfigService,
        },
        {
          provide: JwtService,
          useValue: mockedJwtService,
        },
        {
          provide: getRepositoryToken(User),
          useValue: userRepository,
        },
      ],
    }).compile();
    authenticationService = await module.get(AuthenticationService);
    // usersService = await module.get(UsersService);
  });
  describe('when accessing the data of authenticating user', () => {
    describe('and the provided password is not valid', () => {
      beforeEach(() => {
        bcryptCompare.mockReturnValue(false);
      });
      it('should throw an error', async () => {
        await expect(
          authenticationService.getAuthenticatedUser(
            'user@email.com',
            'strongPassword',
          ),
        ).rejects.toThrow();
      });
    });
    describe('and the provided password is valid', () => {
      beforeEach(() => {
        bcryptCompare.mockReturnValue(true);
      });
      describe('and the user is found in the database', () => {
        beforeEach(() => {
          findUser.mockResolvedValue(userData);
        });
        it('should return a user', async () => {
          const user = await authenticationService.getAuthenticatedUser(
            'user@email.com',
            'strongPassword',
          );
          expect(user).toBe(userData);
        });
      });
      describe('and the user is not found in the database', () => {
        beforeEach(() => {
          findUser.mockResolvedValue(undefined);
        });
        it('should throw an error', async () => {
          await expect(
            authenticationService.getAuthenticatedUser(
              'user@email.com',
              'strongPassword',
            ),
          ).rejects.toThrow();
        });
      });
    });
  });
});
