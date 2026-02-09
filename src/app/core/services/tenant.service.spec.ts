import { TestBed } from '@angular/core/testing';
import { TenantService } from './tenant.service';
import { Tenant, TenantStatus } from '../models/tenant.model';

describe('TenantService', () => {
  let service: TenantService;
  const mockTenant: Tenant = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Test Organization',
    status: TenantStatus.Active
  };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TenantService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Initial State', () => {
    it('should have no tenant set initially', () => {
      expect(service.getCurrentTenant()).toBeNull();
      expect(service.hasTenant()).toBeFalse();
    });

    it('should throw error when getting tenant ID without tenant set', () => {
      expect(() => service.getCurrentTenantId()).toThrowError(
        'Tenant context not set. User must be authenticated first.'
      );
    });
  });

  describe('setCurrentTenant', () => {
    it('should set tenant and emit via observable', (done) => {
      service.currentTenant$.subscribe(tenant => {
        if (tenant) {
          expect(tenant).toEqual(mockTenant);
          expect(service.hasTenant()).toBeTrue();
          done();
        }
      });

      service.setCurrentTenant(mockTenant);
    });

    it('should allow getting tenant ID after setting tenant', () => {
      service.setCurrentTenant(mockTenant);
      expect(service.getCurrentTenantId()).toBe(mockTenant.id);
    });
  });

  describe('clearCurrentTenant', () => {
    it('should clear tenant and emit null', (done) => {
      service.setCurrentTenant(mockTenant);
      
      let emitCount = 0;
      service.currentTenant$.subscribe(tenant => {
        emitCount++;
        if (emitCount === 2) {
          expect(tenant).toBeNull();
          expect(service.hasTenant()).toBeFalse();
          done();
        }
      });

      service.clearCurrentTenant();
    });
  });

  describe('hasTenant', () => {
    it('should return false when no tenant is set', () => {
      expect(service.hasTenant()).toBeFalse();
    });

    it('should return true when tenant is set', () => {
      service.setCurrentTenant(mockTenant);
      expect(service.hasTenant()).toBeTrue();
    });

    it('should return false after clearing tenant', () => {
      service.setCurrentTenant(mockTenant);
      service.clearCurrentTenant();
      expect(service.hasTenant()).toBeFalse();
    });
  });
});
