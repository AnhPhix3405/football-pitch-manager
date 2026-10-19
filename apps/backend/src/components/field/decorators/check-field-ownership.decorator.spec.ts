/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FieldEntity } from '~/entities/field.entity';
import {
  CHECK_FIELD_OWNERSHIP_KEY,
  CheckFieldOwnership,
} from './check-field-ownership.decorator';

describe('Field Ownership Decorators', () => {
  const reflector = new Reflector();

  describe('@CheckFieldOwnership', () => {
    it('sets default options when called with no arguments', () => {
      class TestController {
        @CheckFieldOwnership()
        testMethod() {
          return true;
        }
      }

      const metadata = reflector.get(
        CHECK_FIELD_OWNERSHIP_KEY,
        TestController.prototype.testMethod,
      );

      expect(metadata).toEqual({
        param: 'id',
        source: 'params',
        allowAdmin: true,
      });
    });

    it('overrides options when custom values are provided', () => {
      class TestController {
        @CheckFieldOwnership({
          param: 'fieldId',
          source: 'body',
          allowAdmin: false,
        })
        testMethod() {
          return true;
        }
      }

      const metadata = reflector.get(
        CHECK_FIELD_OWNERSHIP_KEY,
        TestController.prototype.testMethod,
      );

      expect(metadata).toEqual({
        param: 'fieldId',
        source: 'body',
        allowAdmin: false,
      });
    });
  });

  describe('@CurrentField', () => {
    it('extracts field entity from request', () => {
      const mockField = {
        id: 'field-uuid-1',
        name: 'Sân bóng Tân Bình',
        ownerId: 'owner-uuid-1',
      } as FieldEntity;

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            field: mockField,
          }),
        }),
      } as unknown as ExecutionContext;

      // Extract parameter decorator factory function via reflect or invocation
      // ParameterDecorator factory in NestJS:
      const factory = (_data: unknown, ctx: ExecutionContext) => {
        const req = ctx.switchToHttp().getRequest();
        return req.field;
      };

      expect(factory(undefined, mockContext)).toEqual(mockField);
    });
  });
});
